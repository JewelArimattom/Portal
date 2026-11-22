-- UniMatch Database Schema Migration
-- Version: 001_initial_schema
-- Description: Complete database schema for university programme eligibility platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('student', 'admin', 'editor');
CREATE TYPE degree_level AS ENUM ('bachelor', 'master');
CREATE TYPE institution_type AS ENUM ('public', 'private');
CREATE TYPE programme_status AS ENUM ('draft', 'published', 'archived', 'unpublished');
CREATE TYPE intake_status AS ENUM ('upcoming', 'open', 'closed', 'cancelled');
CREATE TYPE verification_status AS ENUM ('draft', 'needs_review', 'verified', 'outdated', 'conflicting', 'university_confirmation_required');
CREATE TYPE requirement_operator AS ENUM ('eq', 'gt', 'gte', 'lt', 'lte', 'contains', 'one_of', 'all_of', 'any_of', 'between');
CREATE TYPE condition_logic AS ENUM ('AND', 'OR');
CREATE TYPE eval_status AS ENUM ('PASSED', 'FAILED', 'UNKNOWN', 'CONDITIONAL', 'NOT_APPLICABLE', 'NEEDS_REVIEW');
CREATE TYPE overall_eligibility AS ENUM ('ELIGIBLE', 'CONDITIONALLY_ELIGIBLE', 'NEEDS_VERIFICATION', 'NOT_ELIGIBLE', 'NOT_EVALUATED');
CREATE TYPE application_status AS ENUM ('interested', 'shortlisted', 'preparing_documents', 'ready_to_apply', 'submitted', 'under_review', 'interview', 'admitted', 'rejected', 'waitlisted', 'withdrawn');
CREATE TYPE document_type AS ENUM ('passport', 'class_10_certificate', 'class_12_certificate', 'bachelor_certificate', 'transcript', 'marksheet', 'english_certificate', 'german_certificate', 'cv', 'motivation_letter', 'recommendation_letter', 'syllabus', 'aps_certificate', 'other');
CREATE TYPE doc_verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE grading_system AS ENUM ('cgpa', 'percentage', 'gpa', 'german', 'other');
CREATE TYPE credit_system AS ENUM ('indian_credits', 'ects', 'us_credits', 'uk_credits', 'other');
CREATE TYPE degree_completion_status AS ENUM ('completed', 'in_progress', 'incomplete', 'dropped');

-- ============================================================
-- TABLE 1: profiles
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  nationality TEXT,
  current_country TEXT,
  current_state TEXT,
  current_city TEXT,
  passport_available TEXT CHECK (passport_available IN ('yes', 'no', 'in_progress')),
  preferred_language TEXT DEFAULT 'en',
  profile_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 2: student_preferences
-- ============================================================

CREATE TABLE student_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  intended_degree degree_level,
  preferred_countries TEXT[] DEFAULT '{}',
  preferred_academic_year TEXT,
  preferred_intake TEXT CHECK (preferred_intake IN ('winter', 'summer', 'flexible')),
  institution_type_preference TEXT CHECK (institution_type_preference IN ('public', 'private', 'both')),
  programme_language TEXT CHECK (programme_language IN ('english', 'german', 'both')),
  willingness_to_learn_german BOOLEAN,
  current_german_level TEXT CHECK (current_german_level IN ('none', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  preferred_subject_areas TEXT[] DEFAULT '{}',
  preferred_cities TEXT[] DEFAULT '{}',
  max_tuition_per_semester NUMERIC(10, 2),
  annual_living_budget NUMERIC(10, 2),
  scholarship_required BOOLEAN DEFAULT FALSE,
  willingness_to_relocate BOOLEAN DEFAULT TRUE,
  willingness_entrance_exam BOOLEAN DEFAULT FALSE,
  preferred_specializations TEXT[] DEFAULT '{}',
  career_goal TEXT,
  research_or_industry TEXT CHECK (research_or_industry IN ('research', 'industry', 'both', 'undecided')),
  willingness_to_change_field BOOLEAN DEFAULT FALSE,
  preferred_duration TEXT,
  importance_tuition INTEGER CHECK (importance_tuition BETWEEN 1 AND 5),
  importance_city INTEGER CHECK (importance_city BETWEEN 1 AND 5),
  importance_reputation INTEGER CHECK (importance_reputation BETWEEN 1 AND 5),
  importance_employment INTEGER CHECK (importance_employment BETWEEN 1 AND 5),
  tuition_preference TEXT,
  application_fee_budget NUMERIC(10, 2),
  financial_flexibility TEXT,
  private_university_affordable BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

-- ============================================================
-- TABLE 3: educations
-- ============================================================

CREATE TABLE educations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  qualification_type TEXT NOT NULL, -- 'class_10', 'class_12', 'bachelor', 'master', 'diploma', 'other'
  qualification_name TEXT,
  board_or_university TEXT,
  institution_name TEXT,
  institution_country TEXT,
  institution_city TEXT,
  institution_type institution_type,
  stream_or_specialization TEXT,
  degree_start_date DATE,
  degree_completion_date DATE,
  completion_year INTEGER,
  duration_years NUMERIC(3, 1),
  number_of_semesters INTEGER,
  full_time BOOLEAN DEFAULT TRUE,
  credit_system credit_system,
  total_credits NUMERIC(10, 2),
  university_recognition TEXT,
  thesis_title TEXT,
  thesis_description TEXT,
  internship_details TEXT,
  subjects_studied TEXT[] DEFAULT '{}',
  mathematics_studied BOOLEAN,
  physics_studied BOOLEAN,
  chemistry_studied BOOLEAN,
  entrance_exam_details TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 4: academic_results
-- ============================================================

CREATE TABLE academic_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  education_id UUID NOT NULL REFERENCES educations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  grading_system grading_system NOT NULL,
  actual_score NUMERIC(10, 4),
  maximum_score NUMERIC(10, 4),
  percentage NUMERIC(5, 2) CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),
  class_or_division TEXT,
  degree_status degree_completion_status DEFAULT 'in_progress',
  failed_subjects INTEGER DEFAULT 0 CHECK (failed_subjects >= 0),
  repeated_subjects INTEGER DEFAULT 0 CHECK (repeated_subjects >= 0),
  backlogs INTEGER DEFAULT 0 CHECK (backlogs >= 0),
  academic_gaps_months INTEGER DEFAULT 0 CHECK (academic_gaps_months >= 0),
  awards TEXT,
  distinctions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 5: subject_categories
-- ============================================================

CREATE TABLE subject_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  parent_category TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 6: subjects
-- ============================================================

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  education_id UUID NOT NULL REFERENCES educations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  semester_number INTEGER NOT NULL CHECK (semester_number > 0),
  subject_name TEXT NOT NULL,
  subject_code TEXT,
  original_credits NUMERIC(10, 2) CHECK (original_credits >= 0),
  credit_system credit_system,
  theory_credits NUMERIC(10, 2) CHECK (theory_credits IS NULL OR theory_credits >= 0),
  practical_credits NUMERIC(10, 2) CHECK (practical_credits IS NULL OR practical_credits >= 0),
  subject_grade TEXT,
  subject_marks NUMERIC(10, 2),
  subject_max_marks NUMERIC(10, 2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 7: subject_category_mappings
-- ============================================================

CREATE TABLE subject_category_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES subject_categories(id) ON DELETE CASCADE,
  confidence TEXT DEFAULT 'manual', -- 'manual', 'suggested'
  mapped_by UUID REFERENCES profiles(id),
  mapped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, category_id)
);

-- ============================================================
-- TABLE 8: language_certificates
-- ============================================================

CREATE TABLE language_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL, -- 'english', 'german'
  test_type TEXT NOT NULL, -- 'ielts', 'toefl', 'pte', 'cambridge', 'duolingo', 'goethe', 'testdaf', 'telc', 'osd', 'dsh', 'other'
  level TEXT, -- For German: A1-C2
  overall_score NUMERIC(5, 2),
  reading_score NUMERIC(5, 2),
  writing_score NUMERIC(5, 2),
  listening_score NUMERIC(5, 2),
  speaking_score NUMERIC(5, 2),
  test_date DATE,
  expiry_date DATE,
  certificate_available BOOLEAN DEFAULT FALSE,
  planned_test_date DATE,
  expected_score NUMERIC(5, 2),
  moi_certificate_available BOOLEAN DEFAULT FALSE,
  english_taught_degree BOOLEAN DEFAULT FALSE,
  section_results JSONB, -- For tests with non-standard sections (e.g., TestDaF TDN scores)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 9: additional_qualifications
-- ============================================================

CREATE TABLE additional_qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  qualification_type TEXT NOT NULL, -- 'internship', 'work', 'research', 'publication', 'project', 'technical_cert', 'professional_cert', 'award', 'volunteering', 'extracurricular'
  title TEXT NOT NULL,
  organization TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  duration_months INTEGER,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 10: documents
-- ============================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_label TEXT,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER CHECK (file_size > 0),
  mime_type TEXT NOT NULL,
  verification_status doc_verification_status DEFAULT 'pending',
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 11: universities
-- ============================================================

CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  institution_type institution_type NOT NULL,
  official_website TEXT,
  admissions_website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  is_demo BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- ============================================================
-- TABLE 12: programmes
-- ============================================================

CREATE TABLE programmes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  degree_level degree_level NOT NULL,
  subject_area TEXT,
  specialization TEXT,
  description TEXT,
  teaching_language TEXT NOT NULL DEFAULT 'english',
  duration_semesters INTEGER CHECK (duration_semesters > 0),
  tuition_fee_per_semester NUMERIC(10, 2) CHECK (tuition_fee_per_semester IS NULL OR tuition_fee_per_semester >= 0),
  semester_contribution NUMERIC(10, 2) CHECK (semester_contribution IS NULL OR semester_contribution >= 0),
  application_fee NUMERIC(10, 2) CHECK (application_fee IS NULL OR application_fee >= 0),
  estimated_living_cost_monthly NUMERIC(10, 2),
  official_programme_url TEXT,
  official_application_url TEXT,
  application_method TEXT CHECK (application_method IN ('uni_assist', 'direct', 'other')),
  status programme_status NOT NULL DEFAULT 'draft',
  is_demo BOOLEAN DEFAULT FALSE,
  requirement_version INTEGER DEFAULT 1,
  last_verified_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- ============================================================
-- TABLE 13: programme_intakes
-- ============================================================

CREATE TABLE programme_intakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  intake_name TEXT NOT NULL, -- 'Winter 2025/26', 'Summer 2026'
  academic_year TEXT NOT NULL,
  application_open_date DATE,
  application_deadline DATE,
  international_deadline DATE,
  status intake_status DEFAULT 'upcoming',
  deadline_verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 14: requirement_condition_groups
-- ============================================================

CREATE TABLE requirement_condition_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  parent_group_id UUID REFERENCES requirement_condition_groups(id) ON DELETE CASCADE,
  logic condition_logic NOT NULL DEFAULT 'AND',
  label TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 15: programme_requirements
-- ============================================================

CREATE TABLE programme_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  condition_group_id UUID REFERENCES requirement_condition_groups(id) ON DELETE SET NULL,
  requirement_type TEXT NOT NULL,
  requirement_description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  operator requirement_operator,
  required_value TEXT,
  required_value_numeric NUMERIC(10, 2),
  unit TEXT,
  applicable_intake TEXT,
  academic_year TEXT,
  -- Subject-credit specific fields
  subject_category_id UUID REFERENCES subject_categories(id),
  min_credits NUMERIC(10, 2),
  credit_system_required credit_system,
  official_ects_equivalent BOOLEAN DEFAULT FALSE,
  practical_credits_count BOOLEAN DEFAULT TRUE,
  allow_double_counting BOOLEAN DEFAULT FALSE,
  verification_status verification_status DEFAULT 'draft',
  reviewer_id UUID REFERENCES profiles(id),
  reviewer_notes TEXT,
  requirement_version INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 16: programme_sources
-- ============================================================

CREATE TABLE programme_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  programme_id UUID REFERENCES programmes(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES programme_requirements(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source_title TEXT,
  date_accessed DATE,
  academic_year TEXT,
  intake TEXT,
  verification_status verification_status DEFAULT 'draft',
  reviewer_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 17: match_results
-- ============================================================

CREATE TABLE match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  intake_id UUID REFERENCES programme_intakes(id),
  overall_eligibility overall_eligibility NOT NULL DEFAULT 'NOT_EVALUATED',
  compatibility_score NUMERIC(5, 2) CHECK (compatibility_score IS NULL OR (compatibility_score >= 0 AND compatibility_score <= 100)),
  degree_relevance_score NUMERIC(5, 2),
  subject_match_score NUMERIC(5, 2),
  academic_performance_score NUMERIC(5, 2),
  language_match_score NUMERIC(5, 2),
  other_requirements_score NUMERIC(5, 2),
  supporting_qualifications_score NUMERIC(5, 2),
  profile_completeness NUMERIC(5, 2),
  is_provisional BOOLEAN DEFAULT TRUE,
  missing_information TEXT[] DEFAULT '{}',
  requirement_version_used INTEGER,
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 18: match_requirement_results
-- ============================================================

CREATE TABLE match_requirement_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_result_id UUID NOT NULL REFERENCES match_results(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES programme_requirements(id) ON DELETE CASCADE,
  status eval_status NOT NULL,
  student_value TEXT,
  required_value TEXT,
  explanation TEXT,
  details JSONB, -- Detailed breakdown (e.g., which subjects counted)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 19: shortlists
-- ============================================================

CREATE TABLE shortlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, programme_id)
);

-- ============================================================
-- TABLE 20: applications
-- ============================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  intake_id UUID REFERENCES programme_intakes(id),
  status application_status NOT NULL DEFAULT 'interested',
  submission_date DATE,
  decision_date DATE,
  official_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 21: application_reminders
-- ============================================================

CREATE TABLE application_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 22: admin_users
-- ============================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'admin',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- TABLE 23: audit_logs
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  previous_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);

-- Student preferences
CREATE INDEX idx_student_preferences_student ON student_preferences(student_id);

-- Educations
CREATE INDEX idx_educations_student ON educations(student_id);
CREATE INDEX idx_educations_type ON educations(qualification_type);

-- Academic results
CREATE INDEX idx_academic_results_education ON academic_results(education_id);
CREATE INDEX idx_academic_results_student ON academic_results(student_id);

-- Subjects
CREATE INDEX idx_subjects_education ON subjects(education_id);
CREATE INDEX idx_subjects_student ON subjects(student_id);
CREATE INDEX idx_subjects_semester ON subjects(semester_number);

-- Subject category mappings
CREATE INDEX idx_scm_subject ON subject_category_mappings(subject_id);
CREATE INDEX idx_scm_category ON subject_category_mappings(category_id);

-- Language certificates
CREATE INDEX idx_lang_certs_student ON language_certificates(student_id);
CREATE INDEX idx_lang_certs_language ON language_certificates(language);

-- Additional qualifications
CREATE INDEX idx_add_quals_student ON additional_qualifications(student_id);

-- Documents
CREATE INDEX idx_documents_student ON documents(student_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- Universities
CREATE INDEX idx_universities_country ON universities(country);
CREATE INDEX idx_universities_city ON universities(city);
CREATE INDEX idx_universities_type ON universities(institution_type);

-- Programmes
CREATE INDEX idx_programmes_university ON programmes(university_id);
CREATE INDEX idx_programmes_degree_level ON programmes(degree_level);
CREATE INDEX idx_programmes_status ON programmes(status);
CREATE INDEX idx_programmes_language ON programmes(teaching_language);
CREATE INDEX idx_programmes_subject ON programmes(subject_area);

-- Programme intakes
CREATE INDEX idx_intakes_programme ON programme_intakes(programme_id);
CREATE INDEX idx_intakes_status ON programme_intakes(status);
CREATE INDEX idx_intakes_deadline ON programme_intakes(application_deadline);

-- Programme requirements
CREATE INDEX idx_requirements_programme ON programme_requirements(programme_id);
CREATE INDEX idx_requirements_type ON programme_requirements(requirement_type);
CREATE INDEX idx_requirements_group ON programme_requirements(condition_group_id);
CREATE INDEX idx_requirements_verification ON programme_requirements(verification_status);

-- Programme sources
CREATE INDEX idx_sources_programme ON programme_sources(programme_id);
CREATE INDEX idx_sources_requirement ON programme_sources(requirement_id);

-- Match results
CREATE INDEX idx_match_student ON match_results(student_id);
CREATE INDEX idx_match_programme ON match_results(programme_id);
CREATE INDEX idx_match_eligibility ON match_results(overall_eligibility);
CREATE INDEX idx_match_score ON match_results(compatibility_score DESC NULLS LAST);

-- Match requirement results
CREATE INDEX idx_match_req_match ON match_requirement_results(match_result_id);
CREATE INDEX idx_match_req_requirement ON match_requirement_results(requirement_id);

-- Shortlists
CREATE INDEX idx_shortlists_student ON shortlists(student_id);
CREATE INDEX idx_shortlists_programme ON shortlists(programme_id);

-- Applications
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_programme ON applications(programme_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Application reminders
CREATE INDEX idx_reminders_application ON application_reminders(application_id);
CREATE INDEX idx_reminders_student ON application_reminders(student_id);
CREATE INDEX idx_reminders_date ON application_reminders(reminder_date);

-- Audit logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_student_preferences BEFORE UPDATE ON student_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_educations BEFORE UPDATE ON educations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_academic_results BEFORE UPDATE ON academic_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_subjects BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_language_certificates BEFORE UPDATE ON language_certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_additional_qualifications BEFORE UPDATE ON additional_qualifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_documents BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_universities BEFORE UPDATE ON universities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_programmes BEFORE UPDATE ON programmes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_programme_intakes BEFORE UPDATE ON programme_intakes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_programme_requirements BEFORE UPDATE ON programme_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_programme_sources BEFORE UPDATE ON programme_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_match_results BEFORE UPDATE ON match_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_applications BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_application_reminders BEFORE UPDATE ON application_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_admin_users BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_condition_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requirement_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role IN ('admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user is admin or editor
CREATE OR REPLACE FUNCTION is_admin_or_editor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (
  id = auth.uid()
);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
  id = auth.uid() OR is_admin(auth.uid())
);

-- STUDENT PREFERENCES
CREATE POLICY prefs_select ON student_preferences FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY prefs_insert ON student_preferences FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY prefs_update ON student_preferences FOR UPDATE USING (
  student_id = auth.uid()
);
CREATE POLICY prefs_delete ON student_preferences FOR DELETE USING (
  student_id = auth.uid()
);

-- EDUCATIONS
CREATE POLICY edu_select ON educations FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY edu_insert ON educations FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY edu_update ON educations FOR UPDATE USING (
  student_id = auth.uid()
);
CREATE POLICY edu_delete ON educations FOR DELETE USING (
  student_id = auth.uid()
);

-- ACADEMIC RESULTS
CREATE POLICY ar_select ON academic_results FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY ar_insert ON academic_results FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY ar_update ON academic_results FOR UPDATE USING (
  student_id = auth.uid()
);
CREATE POLICY ar_delete ON academic_results FOR DELETE USING (
  student_id = auth.uid()
);

-- SUBJECTS
CREATE POLICY subj_select ON subjects FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY subj_insert ON subjects FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY subj_update ON subjects FOR UPDATE USING (
  student_id = auth.uid()
);
CREATE POLICY subj_delete ON subjects FOR DELETE USING (
  student_id = auth.uid()
);

-- SUBJECT CATEGORIES (public read, admin write)
CREATE POLICY sc_select ON subject_categories FOR SELECT USING (true);
CREATE POLICY sc_insert ON subject_categories FOR INSERT WITH CHECK (
  is_admin_or_editor(auth.uid())
);
CREATE POLICY sc_update ON subject_categories FOR UPDATE USING (
  is_admin_or_editor(auth.uid())
);

-- SUBJECT CATEGORY MAPPINGS
CREATE POLICY scm_select ON subject_category_mappings FOR SELECT USING (
  EXISTS (SELECT 1 FROM subjects WHERE subjects.id = subject_id AND subjects.student_id = auth.uid())
  OR is_admin(auth.uid())
);
CREATE POLICY scm_insert ON subject_category_mappings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM subjects WHERE subjects.id = subject_id AND subjects.student_id = auth.uid())
  OR is_admin_or_editor(auth.uid())
);
CREATE POLICY scm_update ON subject_category_mappings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM subjects WHERE subjects.id = subject_id AND subjects.student_id = auth.uid())
  OR is_admin_or_editor(auth.uid())
);
CREATE POLICY scm_delete ON subject_category_mappings FOR DELETE USING (
  EXISTS (SELECT 1 FROM subjects WHERE subjects.id = subject_id AND subjects.student_id = auth.uid())
  OR is_admin_or_editor(auth.uid())
);

-- LANGUAGE CERTIFICATES
CREATE POLICY lc_select ON language_certificates FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY lc_insert ON language_certificates FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY lc_update ON language_certificates FOR UPDATE USING (
  student_id = auth.uid()
);
CREATE POLICY lc_delete ON language_certificates FOR DELETE USING (
  student_id = auth.uid()
);

-- ADDITIONAL QUALIFICATIONS
CREATE POLICY aq_select ON additional_qualifications FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY aq_insert ON additional_qualifications FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY aq_update ON additional_qualifications FOR UPDATE USING (
  student_id = auth.uid()
);
CREATE POLICY aq_delete ON additional_qualifications FOR DELETE USING (
  student_id = auth.uid()
);

-- DOCUMENTS
CREATE POLICY doc_select ON documents FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY doc_insert ON documents FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY doc_update ON documents FOR UPDATE USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY doc_delete ON documents FOR DELETE USING (
  student_id = auth.uid()
);

-- UNIVERSITIES (public read published, admin write)
CREATE POLICY uni_select ON universities FOR SELECT USING (
  status = 'active' OR is_admin_or_editor(auth.uid())
);
CREATE POLICY uni_insert ON universities FOR INSERT WITH CHECK (
  is_admin_or_editor(auth.uid())
);
CREATE POLICY uni_update ON universities FOR UPDATE USING (
  is_admin_or_editor(auth.uid())
);

-- PROGRAMMES (public read published, admin write)
CREATE POLICY prog_select ON programmes FOR SELECT USING (
  status = 'published' OR is_admin_or_editor(auth.uid())
);
CREATE POLICY prog_insert ON programmes FOR INSERT WITH CHECK (
  is_admin_or_editor(auth.uid())
);
CREATE POLICY prog_update ON programmes FOR UPDATE USING (
  is_admin_or_editor(auth.uid())
);

-- PROGRAMME INTAKES
CREATE POLICY pi_select ON programme_intakes FOR SELECT USING (
  EXISTS (SELECT 1 FROM programmes WHERE programmes.id = programme_id AND (programmes.status = 'published' OR is_admin_or_editor(auth.uid())))
);
CREATE POLICY pi_insert ON programme_intakes FOR INSERT WITH CHECK (
  is_admin_or_editor(auth.uid())
);
CREATE POLICY pi_update ON programme_intakes FOR UPDATE USING (
  is_admin_or_editor(auth.uid())
);
CREATE POLICY pi_delete ON programme_intakes FOR DELETE USING (
  is_admin_or_editor(auth.uid())
);

-- REQUIREMENT CONDITION GROUPS
CREATE POLICY rcg_select ON requirement_condition_groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM programmes WHERE programmes.id = programme_id AND (programmes.status = 'published' OR is_admin_or_editor(auth.uid())))
);
CREATE POLICY rcg_insert ON requirement_condition_groups FOR INSERT WITH CHECK (
  is_admin_or_editor(auth.uid())
);
CREATE POLICY rcg_update ON requirement_condition_groups FOR UPDATE USING (
  is_admin_or_editor(auth.uid())
);
CREATE POLICY rcg_delete ON requirement_condition_groups FOR DELETE USING (
  is_admin_or_editor(auth.uid())
);

-- PROGRAMME REQUIREMENTS
CREATE POLICY pr_select ON programme_requirements FOR SELECT USING (
  EXISTS (SELECT 1 FROM programmes WHERE programmes.id = programme_id AND (programmes.status = 'published' OR is_admin_or_editor(auth.uid())))
);
CREATE POLICY pr_insert ON programme_requirements FOR INSERT WITH CHECK (
  is_admin_or_editor(auth.uid())
);
CREATE POLICY pr_update ON programme_requirements FOR UPDATE USING (
  is_admin_or_editor(auth.uid())
);
CREATE POLICY pr_delete ON programme_requirements FOR DELETE USING (
  is_admin(auth.uid())
);

-- PROGRAMME SOURCES
CREATE POLICY ps_select ON programme_sources FOR SELECT USING (
  EXISTS (SELECT 1 FROM programmes WHERE programmes.id = programme_id AND (programmes.status = 'published' OR is_admin_or_editor(auth.uid())))
  OR is_admin_or_editor(auth.uid())
);
CREATE POLICY ps_insert ON programme_sources FOR INSERT WITH CHECK (
  is_admin_or_editor(auth.uid())
);
CREATE POLICY ps_update ON programme_sources FOR UPDATE USING (
  is_admin_or_editor(auth.uid())
);

-- MATCH RESULTS
CREATE POLICY mr_select ON match_results FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY mr_insert ON match_results FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY mr_update ON match_results FOR UPDATE USING (
  student_id = auth.uid()
);
CREATE POLICY mr_delete ON match_results FOR DELETE USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);

-- MATCH REQUIREMENT RESULTS
CREATE POLICY mrr_select ON match_requirement_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM match_results WHERE match_results.id = match_result_id AND (match_results.student_id = auth.uid() OR is_admin(auth.uid())))
);
CREATE POLICY mrr_insert ON match_requirement_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM match_results WHERE match_results.id = match_result_id AND match_results.student_id = auth.uid())
);

-- SHORTLISTS
CREATE POLICY sl_select ON shortlists FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY sl_insert ON shortlists FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY sl_delete ON shortlists FOR DELETE USING (
  student_id = auth.uid()
);

-- APPLICATIONS
CREATE POLICY app_select ON applications FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY app_insert ON applications FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY app_update ON applications FOR UPDATE USING (
  student_id = auth.uid()
);

-- APPLICATION REMINDERS
CREATE POLICY rem_select ON application_reminders FOR SELECT USING (
  student_id = auth.uid() OR is_admin(auth.uid())
);
CREATE POLICY rem_insert ON application_reminders FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY rem_update ON application_reminders FOR UPDATE USING (
  student_id = auth.uid()
);
CREATE POLICY rem_delete ON application_reminders FOR DELETE USING (
  student_id = auth.uid()
);

-- ADMIN USERS
CREATE POLICY au_select ON admin_users FOR SELECT USING (
  is_admin(auth.uid())
);
CREATE POLICY au_insert ON admin_users FOR INSERT WITH CHECK (
  is_admin(auth.uid())
);
CREATE POLICY au_update ON admin_users FOR UPDATE USING (
  is_admin(auth.uid())
);

-- AUDIT LOGS
CREATE POLICY al_select ON audit_logs FOR SELECT USING (
  is_admin(auth.uid())
);
CREATE POLICY al_insert ON audit_logs FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- ============================================================
-- PROFILE CREATION TRIGGER (on auth.users insert)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED SUBJECT CATEGORIES
-- ============================================================

INSERT INTO subject_categories (name, parent_category, description, display_order) VALUES
-- Computer Science
('Programming', 'Computer Science', 'Programming languages and paradigms', 1),
('Data Structures', 'Computer Science', 'Data structures and algorithms fundamentals', 2),
('Algorithms', 'Computer Science', 'Algorithm design and analysis', 3),
('Operating Systems', 'Computer Science', 'Operating systems concepts', 4),
('Database Management', 'Computer Science', 'Database systems and management', 5),
('Computer Networks', 'Computer Science', 'Network protocols and architectures', 6),
('Software Engineering', 'Computer Science', 'Software development methodologies', 7),
('Computer Architecture', 'Computer Science', 'Hardware and system architecture', 8),
('Theory of Computation', 'Computer Science', 'Formal languages and automata', 9),
('Compiler Design', 'Computer Science', 'Compiler construction and design', 10),
('Cybersecurity', 'Computer Science', 'Information and network security', 11),
('Web Development', 'Computer Science', 'Web technologies and frameworks', 12),
-- Mathematics
('Calculus', 'Mathematics', 'Differential and integral calculus', 13),
('Linear Algebra', 'Mathematics', 'Vector spaces and linear transformations', 14),
('Discrete Mathematics', 'Mathematics', 'Combinatorics, graph theory, logic', 15),
('Statistics', 'Mathematics', 'Statistical methods and inference', 16),
('Probability', 'Mathematics', 'Probability theory', 17),
('Numerical Methods', 'Mathematics', 'Computational mathematics', 18),
('Differential Equations', 'Mathematics', 'ODEs and PDEs', 19),
('Optimization', 'Mathematics', 'Mathematical optimization', 20),
('Mathematical Foundations', 'Mathematics', 'General mathematical foundations', 21),
-- AI & Data Science
('Artificial Intelligence', 'AI and Data Science', 'AI foundations and techniques', 22),
('Machine Learning', 'AI and Data Science', 'ML algorithms and applications', 23),
('Deep Learning', 'AI and Data Science', 'Neural networks and deep learning', 24),
('Data Mining', 'AI and Data Science', 'Data mining techniques', 25),
('Data Analytics', 'AI and Data Science', 'Data analysis and visualization', 26),
('Big Data', 'AI and Data Science', 'Big data technologies', 27),
('Natural Language Processing', 'AI and Data Science', 'NLP and text processing', 28),
-- Engineering
('Electronics', 'Engineering', 'Electronic circuits and devices', 29),
('Electrical Engineering', 'Engineering', 'Electrical systems', 30),
('Physics', 'Engineering', 'Engineering physics', 31),
('Digital Logic', 'Engineering', 'Digital logic design', 32),
('Signals and Systems', 'Engineering', 'Signal processing', 33),
-- Business
('Accounting', 'Business', 'Financial and management accounting', 34),
('Economics', 'Business', 'Micro and macroeconomics', 35),
('Finance', 'Business', 'Corporate and financial management', 36),
('Business Management', 'Business', 'Management principles', 37),
('Operations Research', 'Business', 'OR techniques and modeling', 38),
('Business Analytics', 'Business', 'Business data analytics', 39),
-- Other
('General Education', 'Other', 'General education courses', 40),
('Communication', 'Other', 'Communication skills', 41),
('Humanities', 'Other', 'Arts and humanities', 42),
('Unclassified', 'Other', 'Subjects not yet classified', 43);

-- ============================================================
-- STORAGE BUCKET (run in Supabase dashboard or via API)
-- ============================================================
-- Note: Create a private bucket named 'student-documents' in Supabase Storage
-- with the following policies:
-- - Upload: auth.uid() = owner
-- - Download: auth.uid() = owner OR is_admin(auth.uid())
-- - Delete: auth.uid() = owner
