// ============================================================
// Database Enum Types
// ============================================================

export type UserRole = "student" | "admin" | "editor"

export type DegreeLevel = "bachelor" | "master"

export type InstitutionType = "public" | "private"

export type ProgrammeStatus = "draft" | "published" | "archived" | "unpublished"

export type IntakeStatus = "upcoming" | "open" | "closed" | "cancelled"

export type VerificationStatus =
  | "draft"
  | "needs_review"
  | "verified"
  | "outdated"
  | "conflicting"
  | "university_confirmation_required"

export type RequirementOperator =
  | "eq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "one_of"
  | "all_of"
  | "any_of"
  | "between"

export type ConditionLogic = "AND" | "OR"

export type EvalStatus =
  | "PASSED"
  | "FAILED"
  | "UNKNOWN"
  | "CONDITIONAL"
  | "NOT_APPLICABLE"
  | "NEEDS_REVIEW"

export type OverallEligibility =
  | "ELIGIBLE"
  | "CONDITIONALLY_ELIGIBLE"
  | "NEEDS_VERIFICATION"
  | "NOT_ELIGIBLE"
  | "NOT_EVALUATED"

export type ApplicationStatus =
  | "interested"
  | "shortlisted"
  | "preparing_documents"
  | "ready_to_apply"
  | "submitted"
  | "under_review"
  | "interview"
  | "admitted"
  | "rejected"
  | "waitlisted"
  | "withdrawn"

export type DocumentType =
  | "passport"
  | "class_10_certificate"
  | "class_12_certificate"
  | "bachelor_certificate"
  | "transcript"
  | "marksheet"
  | "english_certificate"
  | "german_certificate"
  | "cv"
  | "motivation_letter"
  | "recommendation_letter"
  | "syllabus"
  | "aps_certificate"
  | "other"

export type DocVerificationStatus = "pending" | "verified" | "rejected"

export type GradingSystem = "cgpa" | "percentage" | "gpa" | "german" | "other"

export type CreditSystem =
  | "indian_credits"
  | "ects"
  | "us_credits"
  | "uk_credits"
  | "other"

export type DegreeCompletionStatus =
  | "completed"
  | "in_progress"
  | "incomplete"
  | "dropped"

// ============================================================
// Table Row Types
// ============================================================

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  date_of_birth: string | null
  nationality: string | null
  current_country: string | null
  current_state: string | null
  current_city: string | null
  passport_available: "yes" | "no" | "in_progress" | null
  preferred_language: string | null
  profile_completed: boolean
  onboarding_step: number
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface StudentPreferences {
  id: string
  student_id: string
  intended_degree: DegreeLevel | null
  preferred_countries: string[]
  preferred_academic_year: string | null
  preferred_intake: "winter" | "summer" | "flexible" | null
  institution_type_preference: "public" | "private" | "both" | null
  programme_language: "english" | "german" | "both" | null
  willingness_to_learn_german: boolean | null
  current_german_level: "none" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null
  preferred_subject_areas: string[]
  preferred_cities: string[]
  max_tuition_per_semester: number | null
  annual_living_budget: number | null
  scholarship_required: boolean
  willingness_to_relocate: boolean
  willingness_entrance_exam: boolean
  preferred_specializations: string[]
  career_goal: string | null
  research_or_industry: "research" | "industry" | "both" | "undecided" | null
  willingness_to_change_field: boolean
  preferred_duration: string | null
  importance_tuition: number | null
  importance_city: number | null
  importance_reputation: number | null
  importance_employment: number | null
  tuition_preference: string | null
  application_fee_budget: number | null
  financial_flexibility: string | null
  private_university_affordable: boolean | null
  created_at: string
  updated_at: string
}

export interface Education {
  id: string
  student_id: string
  qualification_type: string
  qualification_name: string | null
  board_or_university: string | null
  institution_name: string | null
  institution_country: string | null
  institution_city: string | null
  institution_type: InstitutionType | null
  stream_or_specialization: string | null
  degree_start_date: string | null
  degree_completion_date: string | null
  completion_year: number | null
  duration_years: number | null
  number_of_semesters: number | null
  full_time: boolean
  credit_system: CreditSystem | null
  total_credits: number | null
  university_recognition: string | null
  thesis_title: string | null
  thesis_description: string | null
  internship_details: string | null
  subjects_studied: string[]
  mathematics_studied: boolean | null
  physics_studied: boolean | null
  chemistry_studied: boolean | null
  entrance_exam_details: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface AcademicResult {
  id: string
  education_id: string
  student_id: string
  grading_system: GradingSystem
  actual_score: number | null
  maximum_score: number | null
  percentage: number | null
  class_or_division: string | null
  degree_status: DegreeCompletionStatus
  failed_subjects: number
  repeated_subjects: number
  backlogs: number
  academic_gaps_months: number
  awards: string | null
  distinctions: string | null
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  education_id: string
  student_id: string
  semester_number: number
  subject_name: string
  subject_code: string | null
  original_credits: number | null
  credit_system: CreditSystem | null
  theory_credits: number | null
  practical_credits: number | null
  subject_grade: string | null
  subject_marks: number | null
  subject_max_marks: number | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface SubjectCategory {
  id: string
  name: string
  parent_category: string | null
  description: string | null
  display_order: number
  created_at: string
}

export interface SubjectCategoryMapping {
  id: string
  subject_id: string
  category_id: string
  confidence: string
  mapped_by: string | null
  mapped_at: string
}

export interface LanguageCertificate {
  id: string
  student_id: string
  language: string
  test_type: string
  level: string | null
  overall_score: number | null
  reading_score: number | null
  writing_score: number | null
  listening_score: number | null
  speaking_score: number | null
  test_date: string | null
  expiry_date: string | null
  certificate_available: boolean
  planned_test_date: string | null
  expected_score: number | null
  moi_certificate_available: boolean
  english_taught_degree: boolean
  section_results: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface AdditionalQualification {
  id: string
  student_id: string
  qualification_type: string
  title: string
  organization: string | null
  description: string | null
  start_date: string | null
  end_date: string | null
  duration_months: number | null
  url: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  student_id: string
  document_type: DocumentType
  document_label: string | null
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
  verification_status: DocVerificationStatus
  verified_by: string | null
  verified_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface University {
  id: string
  name: string
  country: string
  city: string
  institution_type: InstitutionType
  official_website: string | null
  admissions_website: string | null
  contact_email: string | null
  contact_phone: string | null
  description: string | null
  is_public: boolean
  status: "active" | "archived"
  is_demo: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
  source_institution_id: string | null
  federal_state: string | null
  federal_state_code: string | null
  additional_campuses: string[]
  main_category: string | null
  ownership: string | null
  state_recognition: string | null
  degree_awarding_status: string | null
  official_course_portal: string | null
  international_admissions_page: string | null
  application_portal: string | null
  tuition_status: string | null
  international_student_eligibility: string | null
  institution_record_status: string | null
  course_catalog_status: 'not_researched' | 'in_progress' | 'partially_verified' | 'complete'
  research_source: string | null
  verification_date: string | null
}

export interface Programme {
  id: string
  university_id: string
  name: string
  degree_level: DegreeLevel
  subject_area: string | null
  specialization: string | null
  description: string | null
  teaching_language: string
  duration_semesters: number | null
  tuition_fee_per_semester: number | null
  tuition_fee_status: 'known' | 'unknown' | 'not_applicable' | null
  semester_contribution: number | null
  application_fee: number | null
  estimated_living_cost_monthly: number | null
  official_programme_url: string | null
  official_application_url: string | null
  application_method: "uni_assist" | "direct" | "other" | null
  status: ProgrammeStatus
  is_demo: boolean
  requirement_version: number
  requirements_data_status: 'unknown' | 'partial' | 'complete'
  admission_selectivity: 'unknown' | 'open' | 'restricted' | 'special_requirements'
  requirements_data_checked_at: string | null
  last_verified_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface ProgrammeIntake {
  id: string
  programme_id: string
  intake_name: string
  academic_year: string
  application_open_date: string | null
  application_deadline: string | null
  international_deadline: string | null
  status: IntakeStatus
  deadline_verified_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ProgrammeRequirement {
  id: string
  programme_id: string
  condition_group_id: string | null
  requirement_type: string
  requirement_description: string | null
  is_mandatory: boolean
  operator: RequirementOperator | null
  required_value: string | null
  required_value_numeric: number | null
  unit: string | null
  applicable_intake: string | null
  academic_year: string | null
  subject_category_id: string | null
  min_credits: number | null
  credit_system_required: CreditSystem | null
  official_ects_equivalent: boolean
  practical_credits_count: boolean
  allow_double_counting: boolean
  verification_status: VerificationStatus
  reviewer_id: string | null
  reviewer_notes: string | null
  requirement_version: number
  display_order: number
  created_at: string
  updated_at: string
}

export interface RequirementConditionGroup {
  id: string
  programme_id: string
  parent_group_id: string | null
  logic: ConditionLogic
  label: string | null
  display_order: number
  created_at: string
}

export interface ProgrammeSource {
  id: string
  programme_id: string | null
  requirement_id: string | null
  url: string
  source_title: string | null
  date_accessed: string | null
  academic_year: string | null
  intake: string | null
  verification_status: VerificationStatus
  reviewer_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MatchResult {
  id: string
  student_id: string
  programme_id: string
  intake_id: string | null
  overall_eligibility: OverallEligibility
  compatibility_score: number | null
  degree_relevance_score: number | null
  subject_match_score: number | null
  academic_performance_score: number | null
  language_match_score: number | null
  other_requirements_score: number | null
  supporting_qualifications_score: number | null
  profile_completeness: number | null
  is_provisional: boolean
  missing_information: string[]
  requirement_version_used: number | null
  evaluated_at: string
  created_at: string
  updated_at: string
}

export interface MatchRequirementResult {
  id: string
  match_result_id: string
  requirement_id: string
  status: EvalStatus
  student_value: string | null
  required_value: string | null
  explanation: string | null
  details: Record<string, unknown> | null
  created_at: string
}

export interface Shortlist {
  id: string
  student_id: string
  programme_id: string
  notes: string | null
  created_at: string
}

export interface Application {
  id: string
  student_id: string
  programme_id: string
  intake_id: string | null
  status: ApplicationStatus
  submission_date: string | null
  decision_date: string | null
  official_reference: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ApplicationReminder {
  id: string
  application_id: string
  student_id: string
  reminder_date: string
  title: string
  description: string | null
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  role: UserRole
  permissions: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  previous_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

// ============================================================
// Database Schema (Supabase-compatible)
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string
          updated_at?: string
          profile_completed?: boolean
          onboarding_step?: number
        }
        Update: Partial<Omit<Profile, "id">>
      }
      student_preferences: {
        Row: StudentPreferences
        Insert: Omit<StudentPreferences, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<StudentPreferences, "id">>
      }
      educations: {
        Row: Education
        Insert: Omit<Education, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Education, "id">>
      }
      academic_results: {
        Row: AcademicResult
        Insert: Omit<AcademicResult, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<AcademicResult, "id">>
      }
      subjects: {
        Row: Subject
        Insert: Omit<Subject, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Subject, "id">>
      }
      subject_categories: {
        Row: SubjectCategory
        Insert: Omit<SubjectCategory, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<SubjectCategory, "id">>
      }
      subject_category_mappings: {
        Row: SubjectCategoryMapping
        Insert: Omit<SubjectCategoryMapping, "id" | "mapped_at"> & {
          id?: string
          mapped_at?: string
        }
        Update: Partial<Omit<SubjectCategoryMapping, "id">>
      }
      language_certificates: {
        Row: LanguageCertificate
        Insert: Omit<LanguageCertificate, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<LanguageCertificate, "id">>
      }
      additional_qualifications: {
        Row: AdditionalQualification
        Insert: Omit<
          AdditionalQualification,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<AdditionalQualification, "id">>
      }
      documents: {
        Row: Document
        Insert: Omit<Document, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Document, "id">>
      }
      universities: {
        Row: University
        Insert: Omit<University, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<University, "id">>
      }
      programmes: {
        Row: Programme
        Insert: Omit<Programme, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Programme, "id">>
      }
      programme_intakes: {
        Row: ProgrammeIntake
        Insert: Omit<ProgrammeIntake, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ProgrammeIntake, "id">>
      }
      programme_requirements: {
        Row: ProgrammeRequirement
        Insert: Omit<
          ProgrammeRequirement,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ProgrammeRequirement, "id">>
      }
      requirement_condition_groups: {
        Row: RequirementConditionGroup
        Insert: Omit<RequirementConditionGroup, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<RequirementConditionGroup, "id">>
      }
      programme_sources: {
        Row: ProgrammeSource
        Insert: Omit<ProgrammeSource, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ProgrammeSource, "id">>
      }
      match_results: {
        Row: MatchResult
        Insert: Omit<MatchResult, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<MatchResult, "id">>
      }
      match_requirement_results: {
        Row: MatchRequirementResult
        Insert: Omit<MatchRequirementResult, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<MatchRequirementResult, "id">>
      }
      shortlists: {
        Row: Shortlist
        Insert: Omit<Shortlist, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Shortlist, "id">>
      }
      applications: {
        Row: Application
        Insert: Omit<Application, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Application, "id">>
      }
      application_reminders: {
        Row: ApplicationReminder
        Insert: Omit<
          ApplicationReminder,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ApplicationReminder, "id">>
      }
      admin_users: {
        Row: AdminUser
        Insert: Omit<AdminUser, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<AdminUser, "id">>
      }
      audit_logs: {
        Row: AuditLog
        Insert: Omit<AuditLog, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<AuditLog, "id">>
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_or_editor: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      degree_level: DegreeLevel
      institution_type: InstitutionType
      programme_status: ProgrammeStatus
      intake_status: IntakeStatus
      verification_status: VerificationStatus
      requirement_operator: RequirementOperator
      condition_logic: ConditionLogic
      eval_status: EvalStatus
      overall_eligibility: OverallEligibility
      application_status: ApplicationStatus
      document_type: DocumentType
      doc_verification_status: DocVerificationStatus
      grading_system: GradingSystem
      credit_system: CreditSystem
      degree_completion_status: DegreeCompletionStatus
    }
  }
}
