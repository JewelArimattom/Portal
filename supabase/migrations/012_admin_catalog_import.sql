-- Protect admin deletes and provide an all-or-nothing catalog CSV import.
CREATE POLICY uni_delete_admin ON universities FOR DELETE USING (is_admin(auth.uid()));
CREATE POLICY prog_delete_admin ON programmes FOR DELETE USING (is_admin(auth.uid()));

-- The original profile update policy allows users to edit their own profile.
-- Keep that, but prevent them from changing their own role through the API.
CREATE OR REPLACE FUNCTION protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT is_admin(auth.uid()) THEN
    IF TG_OP = 'INSERT' AND NEW.role <> 'student' THEN
      RAISE EXCEPTION 'Only administrators can assign privileged roles';
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Only administrators can change account roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_profile_role_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_profile_role();
CREATE TRIGGER guard_profile_role_update
  BEFORE UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_profile_role();

CREATE OR REPLACE FUNCTION admin_import_catalog(p_universities JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_university JSONB;
  v_programme JSONB;
  v_requirement JSONB;
  v_university_id UUID;
  v_programme_id UUID;
  v_requirement_id UUID;
  v_university_count INTEGER := 0;
  v_programme_count INTEGER := 0;
  v_requirement_count INTEGER := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  IF jsonb_typeof(p_universities) <> 'array' OR jsonb_array_length(p_universities) = 0 THEN
    RAISE EXCEPTION 'The import must contain at least one institution';
  END IF;

  FOR v_university IN SELECT value FROM jsonb_array_elements(p_universities)
  LOOP
    IF EXISTS (
      SELECT 1 FROM universities u
      WHERE lower(trim(u.name)) = lower(trim(v_university->>'name'))
        AND lower(trim(u.country)) = lower(trim(v_university->>'country'))
    ) THEN
      RAISE EXCEPTION 'Institution already exists: % (%)', v_university->>'name', v_university->>'country';
    END IF;

    INSERT INTO universities (name, country, city, institution_type, official_website,
      admissions_website, description, is_public, status, is_demo, created_by)
    VALUES (
      trim(v_university->>'name'), trim(v_university->>'country'), trim(v_university->>'city'),
      (v_university->>'institution_type')::institution_type,
      NULLIF(trim(v_university->>'official_website'), ''),
      NULLIF(trim(v_university->>'admissions_website'), ''),
      NULLIF(trim(v_university->>'description'), ''),
      COALESCE((v_university->>'is_public')::BOOLEAN, true), 'active', false, auth.uid()
    ) RETURNING id INTO v_university_id;
    v_university_count := v_university_count + 1;

    FOR v_programme IN SELECT value FROM jsonb_array_elements(v_university->'programmes')
    LOOP
      IF EXISTS (
        SELECT 1 FROM programmes p
        WHERE p.university_id = v_university_id
          AND lower(trim(p.name)) = lower(trim(v_programme->>'name'))
          AND p.degree_level = (v_programme->>'degree_level')::degree_level
      ) THEN
        RAISE EXCEPTION 'Duplicate programme in import: %', v_programme->>'name';
      END IF;

      INSERT INTO programmes (university_id, name, degree_level, subject_area, specialization,
        description, teaching_language, duration_semesters, tuition_fee_per_semester,
        semester_contribution, application_fee, official_programme_url, official_application_url,
        application_method, status, is_demo, requirements_data_status, admission_selectivity, created_by)
      VALUES (
        v_university_id, trim(v_programme->>'name'), (v_programme->>'degree_level')::degree_level,
        NULLIF(trim(v_programme->>'subject_area'), ''), NULLIF(trim(v_programme->>'specialization'), ''),
        NULLIF(trim(v_programme->>'description'), ''), lower(trim(v_programme->>'teaching_language')),
        NULLIF(v_programme->>'duration_semesters', '')::INTEGER,
        NULLIF(v_programme->>'tuition_fee_per_semester', '')::NUMERIC,
        NULLIF(v_programme->>'semester_contribution', '')::NUMERIC,
        NULLIF(v_programme->>'application_fee', '')::NUMERIC,
        NULLIF(trim(v_programme->>'official_programme_url'), ''),
        NULLIF(trim(v_programme->>'official_application_url'), ''),
        NULLIF(v_programme->>'application_method', ''),
        'draft', false,
        CASE WHEN jsonb_array_length(COALESCE(v_programme->'requirements', '[]'::JSONB)) > 0 THEN 'partial' ELSE 'unknown' END,
        'unknown', auth.uid()
      ) RETURNING id INTO v_programme_id;
      v_programme_count := v_programme_count + 1;

      FOR v_requirement IN SELECT value FROM jsonb_array_elements(COALESCE(v_programme->'requirements', '[]'::JSONB))
      LOOP
        INSERT INTO programme_requirements (programme_id, requirement_type, requirement_description,
          is_mandatory, operator, required_value, required_value_numeric, unit, verification_status)
        VALUES (
          v_programme_id, trim(v_requirement->>'type'), NULLIF(trim(v_requirement->>'description'), ''),
          COALESCE((v_requirement->>'mandatory')::BOOLEAN, true),
          COALESCE(NULLIF(v_requirement->>'operator', '')::requirement_operator, 'gte'),
          NULLIF(trim(v_requirement->>'value'), ''), NULLIF(v_requirement->>'numeric_value', '')::NUMERIC,
          NULLIF(trim(v_requirement->>'unit'), ''), 'draft'
        ) RETURNING id INTO v_requirement_id;

        -- Keep the programme id stable while inserting citations.
        v_requirement_count := v_requirement_count + 1;
        IF NULLIF(trim(v_requirement->>'source_url'), '') IS NOT NULL THEN
          INSERT INTO programme_sources (programme_id, requirement_id, url, source_title, date_accessed, verification_status)
          VALUES (v_programme_id, v_requirement_id,
            trim(v_requirement->>'source_url'), NULLIF(trim(v_requirement->>'source_title'), ''), CURRENT_DATE, 'draft');
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('universities', v_university_count, 'programmes', v_programme_count, 'requirements', v_requirement_count);
END;
$$;

REVOKE ALL ON FUNCTION admin_import_catalog(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_import_catalog(JSONB) TO authenticated;
