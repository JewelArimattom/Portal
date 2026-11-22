-- Track whether programme-specific admission rules are complete enough for
-- student eligibility matching. Catalogue presence alone is not evidence of
-- admission eligibility or probability.

ALTER TABLE programmes
  ADD COLUMN IF NOT EXISTS requirements_data_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (requirements_data_status IN ('unknown', 'partial', 'complete')),
  ADD COLUMN IF NOT EXISTS admission_selectivity TEXT NOT NULL DEFAULT 'unknown'
    CHECK (admission_selectivity IN ('unknown', 'open', 'restricted', 'special_requirements')),
  ADD COLUMN IF NOT EXISTS requirements_data_checked_at DATE;

COMMENT ON COLUMN programmes.requirements_data_status IS
  'Completeness of official, programme-specific admission rules; complete requires verified, source-linked requirements.';
COMMENT ON COLUMN programmes.admission_selectivity IS
  'Published admission category only; this is not an individual admission probability.';

-- Existing rule sets are complete only when every rule is verified and linked
-- to a verified official source. Existing unverified or source-less rules stay partial.
UPDATE programmes p
SET requirements_data_status = CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM programme_requirements r WHERE r.programme_id = p.id
      ) THEN 'unknown'
      WHEN EXISTS (
        SELECT 1
        FROM programme_requirements r
        WHERE r.programme_id = p.id
          AND (r.verification_status <> 'verified' OR NOT EXISTS (
            SELECT 1 FROM programme_sources s
            WHERE s.requirement_id = r.id AND s.verification_status = 'verified'
          ))
      ) THEN 'partial'
      ELSE 'complete'
    END;

-- The Freiburg catalogue gives an official first-semester access category, but
-- that category does not replace the programme's detailed subject/grade rules.
UPDATE programmes p
SET requirements_data_status = 'partial',
    admission_selectivity = CASE
      WHEN lower(p.description) LIKE '%without special prerequisites for admission%'
        OR lower(p.description) LIKE '%free admission%' THEN 'open'
      WHEN lower(p.description) LIKE '%restricted admission%'
        OR lower(p.description) LIKE '%with admission restrictions%' THEN 'restricted'
      WHEN lower(p.description) LIKE '%with special prerequisites for admission%' THEN 'special_requirements'
      ELSE 'unknown'
    END,
    requirements_data_checked_at = DATE '2026-11-21'
FROM universities u
WHERE u.id = p.university_id
  AND u.source_institution_id = 'DE-BW-002'
  AND p.official_programme_url LIKE 'https://uni-freiburg.de/%';

-- Record the official general admissions guidance used during these catalogue
-- imports. These pages provide common entry routes, not every programme's rules.
INSERT INTO programme_sources (programme_id, url, source_title, date_accessed,
  verification_status, notes)
SELECT p.id, 'https://www.allensbach-hochschule.de/en/contact/faq/',
  'Official Allensbach Hochschule admissions FAQ', DATE '2026-11-22', 'verified',
  'General Bachelor/Master access routes and MBA experience conditions. Programme-specific prerequisites still need individual verification.'
FROM programmes p
JOIN universities u ON u.id = p.university_id
WHERE u.source_institution_id = 'DE-BW-003'
  AND p.official_programme_url LIKE 'https://www.allensbach-hochschule.de/%'
  AND NOT EXISTS (
    SELECT 1 FROM programme_sources s
    WHERE s.programme_id = p.id
      AND s.url = 'https://www.allensbach-hochschule.de/en/contact/faq/'
  );

INSERT INTO programme_sources (programme_id, url, source_title, date_accessed,
  verification_status, notes)
SELECT p.id, 'https://www.akad.de/zulassungsvoraussetzungen/',
  'Official AKAD University admission requirements', DATE '2026-11-22', 'verified',
  'General Bachelor/Master access routes and language guidance. Programme-specific prerequisites and language thresholds still need individual verification.'
FROM programmes p
JOIN universities u ON u.id = p.university_id
WHERE u.source_institution_id = 'DE-BW-001'
  AND p.official_programme_url LIKE 'https://www.akad.de/abschluss/%'
  AND NOT EXISTS (
    SELECT 1 FROM programme_sources s
    WHERE s.programme_id = p.id
      AND s.url = 'https://www.akad.de/zulassungsvoraussetzungen/'
  );

UPDATE programmes p
SET requirements_data_status = 'partial',
    requirements_data_checked_at = DATE '2026-11-22'
FROM universities u
WHERE u.id = p.university_id
  AND u.source_institution_id IN ('DE-BW-001', 'DE-BW-003')
  AND (p.official_programme_url LIKE 'https://www.akad.de/abschluss/%'
    OR p.official_programme_url LIKE 'https://www.allensbach-hochschule.de/%');

-- Leave every non-target programme at its computed rule/source completeness.
-- New programme records default to unknown until an editor verifies their rules.
