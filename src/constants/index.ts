// ============================================================
// Subject Categories Taxonomy
// ============================================================

export const SUBJECT_CATEGORIES = {
  "Computer Science": [
    "Programming",
    "Data Structures",
    "Algorithms",
    "Operating Systems",
    "Database Management",
    "Computer Networks",
    "Software Engineering",
    "Computer Architecture",
    "Theory of Computation",
    "Compiler Design",
    "Cybersecurity",
    "Web Development",
  ],
  Mathematics: [
    "Calculus",
    "Linear Algebra",
    "Discrete Mathematics",
    "Statistics",
    "Probability",
    "Numerical Methods",
    "Differential Equations",
    "Optimization",
    "Mathematical Foundations",
  ],
  "AI and Data Science": [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Data Mining",
    "Data Analytics",
    "Big Data",
    "Natural Language Processing",
  ],
  Engineering: [
    "Electronics",
    "Electrical Engineering",
    "Physics",
    "Digital Logic",
    "Signals and Systems",
  ],
  Business: [
    "Accounting",
    "Economics",
    "Finance",
    "Business Management",
    "Operations Research",
    "Business Analytics",
  ],
  Other: ["General Education", "Communication", "Humanities", "Unclassified"],
} as const

// ============================================================
// Compatibility Score Weights
// ============================================================

export const COMPATIBILITY_WEIGHTS = {
  degree_relevance: 20,
  subject_match: 30,
  academic_performance: 15,
  language_match: 15,
  other_requirements: 10,
  supporting_qualifications: 10,
} as const

// ============================================================
// Countries
// ============================================================

export const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Czech Republic",
  "Denmark",
  "Egypt",
  "Ethiopia",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Hungary",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kenya",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "Turkey",
  "UAE",
  "Uganda",
  "Ukraine",
  "United Kingdom",
  "United States",
  "Vietnam",
] as const

// ============================================================
// Grading Systems
// ============================================================

export const GRADING_SYSTEMS = [
  { value: "cgpa", label: "CGPA (e.g., 0–10)" },
  { value: "percentage", label: "Percentage (0–100%)" },
  { value: "gpa", label: "GPA (e.g., 0–4.0)" },
  { value: "german", label: "German Grade (1.0–5.0)" },
  { value: "other", label: "Other" },
] as const

// ============================================================
// Credit Systems
// ============================================================

export const CREDIT_SYSTEMS = [
  { value: "indian_credits", label: "Indian Credits" },
  { value: "ects", label: "ECTS (European)" },
  { value: "us_credits", label: "US Credits" },
  { value: "uk_credits", label: "UK Credits" },
  { value: "other", label: "Other" },
] as const

// ============================================================
// Degree Levels
// ============================================================

export const DEGREE_LEVELS = [
  { value: "bachelor", label: "Bachelor's" },
  { value: "master", label: "Master's" },
] as const

// ============================================================
// Language Test Types
// ============================================================

export const ENGLISH_TEST_TYPES = [
  { value: "ielts", label: "IELTS" },
  { value: "toefl", label: "TOEFL iBT" },
  { value: "pte", label: "PTE Academic" },
  { value: "cambridge", label: "Cambridge (C1/C2)" },
  { value: "duolingo", label: "Duolingo English Test" },
] as const

export const GERMAN_TEST_TYPES = [
  { value: "goethe", label: "Goethe-Zertifikat" },
  { value: "testdaf", label: "TestDaF" },
  { value: "telc", label: "telc Deutsch" },
  { value: "osd", label: "ÖSD" },
  { value: "dsh", label: "DSH" },
] as const

export const GERMAN_LEVELS = [
  "none",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const

// ============================================================
// Application Statuses
// ============================================================

export const APPLICATION_STATUS_OPTIONS = [
  { value: "interested", label: "Interested" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "preparing_documents", label: "Preparing Documents" },
  { value: "ready_to_apply", label: "Ready to Apply" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "interview", label: "Interview" },
  { value: "admitted", label: "Admitted" },
  { value: "rejected", label: "Rejected" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "withdrawn", label: "Withdrawn" },
] as const

// ============================================================
// Qualification Types
// ============================================================

export const QUALIFICATION_TYPES = [
  { value: "class_10", label: "Class 10 / SSC / ICSE" },
  { value: "class_12", label: "Class 12 / HSC / ISC" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "diploma", label: "Diploma" },
  { value: "other", label: "Other" },
] as const

// ============================================================
// Additional Qualification Types
// ============================================================

export const ADDITIONAL_QUALIFICATION_TYPES = [
  { value: "internship", label: "Internship" },
  { value: "work", label: "Work Experience" },
  { value: "research", label: "Research Experience" },
  { value: "publication", label: "Publication" },
  { value: "project", label: "Project" },
  { value: "technical_cert", label: "Technical Certification" },
  { value: "professional_cert", label: "Professional Certification" },
  { value: "award", label: "Award / Achievement" },
  { value: "volunteering", label: "Volunteering" },
  { value: "extracurricular", label: "Extracurricular Activity" },
] as const

// ============================================================
// Document Types
// ============================================================

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "passport", label: "Passport" },
  { value: "class_10_certificate", label: "Class 10 Certificate" },
  { value: "class_12_certificate", label: "Class 12 Certificate" },
  { value: "bachelor_certificate", label: "Bachelor's Certificate" },
  { value: "transcript", label: "Transcript" },
  { value: "marksheet", label: "Marksheet" },
  { value: "english_certificate", label: "English Language Certificate" },
  { value: "german_certificate", label: "German Language Certificate" },
  { value: "cv", label: "CV / Resume" },
  { value: "motivation_letter", label: "Motivation Letter" },
  { value: "recommendation_letter", label: "Recommendation Letter" },
  { value: "syllabus", label: "Course Syllabus" },
  { value: "aps_certificate", label: "APS Certificate" },
  { value: "other", label: "Other" },
] as const

// ============================================================
// Intake Options
// ============================================================

export const INTAKE_OPTIONS = [
  { value: "winter", label: "Winter Semester" },
  { value: "summer", label: "Summer Semester" },
  { value: "flexible", label: "Flexible" },
] as const

// ============================================================
// Institution Type Options
// ============================================================

export const INSTITUTION_TYPES = [
  { value: "public", label: "Public University" },
  { value: "private", label: "Private University" },
] as const

// ============================================================
// Programme Languages
// ============================================================

export const PROGRAMME_LANGUAGES = [
  { value: "english", label: "English" },
  { value: "german", label: "German" },
  { value: "both", label: "Both (English & German)" },
] as const
