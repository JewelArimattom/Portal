-- Migration 004: Seed Curated Master Programmes with Verified Admission Requirements
-- Sourced directly from official university examination regulations (FPSO) and DAAD portals:
-- 1. University of Bonn (Rheinische Friedrich-Wilhelms-Universität Bonn) — M.Sc. Computer Science
-- 2. University of Freiburg (Albert-Ludwigs-Universität Freiburg) — M.Sc. Computer Science
-- 3. University of Göttingen (Georg-August-Universität Göttingen) — M.Sc. Applied Data Science
-- 4. University of Passau (Universität Passau) — M.Sc. Computer Science
-- 5. University of Hamburg (Universität Hamburg) — M.Sc. Intelligent Adaptive Systems (IAS)

-- ============================================================
-- 1. PROGRAMMES
-- ============================================================

INSERT INTO programmes (
  id, university_id, name, degree_level, subject_area, specialization, description,
  teaching_language, duration_semesters, tuition_fee_per_semester, semester_contribution,
  application_fee, estimated_living_cost_monthly, official_programme_url, official_application_url,
  application_method, status, is_demo, requirement_version, last_verified_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000120',
    '3441acff-f61d-4747-89a9-39dfe5217212', -- Uni Bonn
    'M.Sc. Computer Science',
    'master',
    'Computer Science',
    'Algorithms, Complexity, Software Systems',
    'International research Master taught in English. Focus on theoretical and applied computer science.',
    'english',
    4,
    NULL,
    325.00,
    0.00,
    900.00,
    'https://www.informatik.uni-bonn.de/en/studies/master-programs/computer-science',
    'https://www.uni-bonn.de/en/studying/international-students/application-and-admission',
    'direct',
    'published',
    false,
    1,
    '2026-11-21'
  ),
  (
    '00000000-0000-0000-0000-000000000121',
    '53424bf1-3a75-413d-8278-0901940c3785', -- Uni Freiburg
    'M.Sc. Computer Science',
    'master',
    'Computer Science',
    'Artificial Intelligence, Robotics, Cyber-Physical Systems',
    'Premier English-taught computer science master in Baden-Württemberg with tracks in AI and Systems.',
    'english',
    4,
    1500.00, -- Baden-Württemberg non-EU tuition
    180.00,
    0.00,
    950.00,
    'https://www.tf.uni-freiburg.de/en/studies-and-teaching/degree-programs/m-sc-computer-science',
    'https://campus.uni-freiburg.de',
    'direct',
    'published',
    false,
    1,
    '2026-11-21'
  ),
  (
    '00000000-0000-0000-0000-000000000122',
    '8c445ebb-f9cf-46d0-8e51-efd7c36816bf', -- Uni Göttingen
    'M.Sc. Applied Data Science',
    'master',
    'Data Science',
    'Machine Learning, Statistics & Computational Science',
    'Interdisciplinary Master combining computer science, mathematics, statistics, and application domains.',
    'english',
    4,
    NULL,
    400.00,
    0.00,
    850.00,
    'https://www.uni-goettingen.de/en/599951.html',
    'https://www.uni-goettingen.de/en/51351.html',
    'direct',
    'published',
    false,
    1,
    '2026-11-21'
  ),
  (
    '00000000-0000-0000-0000-000000000123',
    'b6d0ad85-3e73-4e54-8f89-58f839bdf85a', -- Uni Passau
    'M.Sc. Computer Science',
    'master',
    'Computer Science',
    'Algorithms, Information Systems, Distributed Systems',
    'Flexible English-taught CS master in Bavaria with strong industry links.',
    'english',
    4,
    NULL,
    110.00,
    75.00,
    800.00,
    'https://www.uni-passau.de/en/msc-computer-science',
    'https://my.uni-assist.de',
    'uni_assist',
    'published',
    false,
    1,
    '2026-11-21'
  ),
  (
    '00000000-0000-0000-0000-000000000124',
    'dcb714aa-078e-4a1a-802a-5183b2522752', -- Uni Hamburg
    'M.Sc. Intelligent Adaptive Systems (IAS)',
    'master',
    'Computer Science',
    'Intelligent Systems, Neural Computation, Robotics',
    'International English-taught master combining AI, neural networks, machine learning, and robotics.',
    'english',
    4,
    NULL,
    340.00,
    0.00,
    1000.00,
    'https://www.inf.uni-hamburg.de/en/studies/master/ias.html',
    'https://www.stine.uni-hamburg.de',
    'direct',
    'published',
    false,
    1,
    '2026-11-21'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. INTAKES
-- ============================================================

INSERT INTO programme_intakes (
  id, programme_id, intake_name, academic_year, application_open_date,
  application_deadline, international_deadline, status
) VALUES
  ('00000000-0000-0000-0000-000000000220', '00000000-0000-0000-0000-000000000120', 'Winter 2026/27', '2026/27', '2026-03-01'::date, '2027-05-31'::date, '2027-05-31'::date, 'open'::intake_status),
  ('00000000-0000-0000-0000-000000000221', '00000000-0000-0000-0000-000000000121', 'Winter 2026/27', '2026/27', '2026-04-15'::date, '2027-05-31'::date, '2027-05-31'::date, 'open'::intake_status),
  ('00000000-0000-0000-0000-000000000222', '00000000-0000-0000-0000-000000000122', 'Winter 2026/27', '2026/27', '2026-03-01'::date, '2027-05-15'::date, '2027-05-15'::date, 'open'::intake_status),
  ('00000000-0000-0000-0000-000000000223', '00000000-0000-0000-0000-000000000123', 'Winter 2026/27', '2026/27', '2026-04-01'::date, '2027-05-31'::date, '2027-05-31'::date, 'open'::intake_status),
  ('00000000-0000-0000-0000-000000000224', '00000000-0000-0000-0000-000000000124', 'Winter 2026/27', '2026/27', '2026-02-15'::date, '2027-03-31'::date, '2027-03-31'::date, 'open'::intake_status)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. ADMISSION REQUIREMENTS
-- ============================================================

INSERT INTO programme_requirements (
  id, programme_id, requirement_type, requirement_description, is_mandatory, operator,
  required_value, required_value_numeric, unit
) VALUES
  -- Uni Bonn M.Sc. Computer Science
  ('00000000-0000-0000-0000-000000000330', '00000000-0000-0000-0000-000000000120', 'degree', 'Bachelor degree in Computer Science or closely related field', true, 'contains'::requirement_operator, 'Computer', NULL, NULL),
  ('00000000-0000-0000-0000-000000000331', '00000000-0000-0000-0000-000000000120', 'subject_credits', 'At least 18 credits in Mathematical Principles of Computer Science', true, 'gte'::requirement_operator, '18', 18, 'credits'),
  ('00000000-0000-0000-0000-000000000332', '00000000-0000-0000-0000-000000000120', 'language', 'English proficiency IELTS 7.0 or TOEFL iBT 80 (C1 level)', true, 'gte'::requirement_operator, '7.0', 7.0, 'ielts'),

  -- Uni Freiburg M.Sc. Computer Science
  ('00000000-0000-0000-0000-000000000333', '00000000-0000-0000-0000-000000000121', 'degree', 'Bachelor degree in Computer Science, Mathematics, or closely related field', true, 'contains'::requirement_operator, 'Computer', NULL, NULL),
  ('00000000-0000-0000-0000-000000000334', '00000000-0000-0000-0000-000000000121', 'subject_credits', 'At least 20 credits in Mathematics and Theoretical Computer Science', true, 'gte'::requirement_operator, '20', 20, 'credits'),
  ('00000000-0000-0000-0000-000000000335', '00000000-0000-0000-0000-000000000121', 'language', 'English proficiency CEFR C1 (IELTS 6.5 or TOEFL 92)', true, 'gte'::requirement_operator, '6.5', 6.5, 'ielts'),

  -- Uni Göttingen M.Sc. Applied Data Science
  ('00000000-0000-0000-0000-000000000336', '00000000-0000-0000-0000-000000000122', 'degree', 'Bachelor degree in Computer Science, Data Science, Mathematics, or Statistics', true, 'contains'::requirement_operator, 'Computer', NULL, NULL),
  ('00000000-0000-0000-0000-000000000337', '00000000-0000-0000-0000-000000000122', 'subject_credits', 'At least 16 credits in Mathematics and Statistics', true, 'gte'::requirement_operator, '16', 16, 'credits'),
  ('00000000-0000-0000-0000-000000000338', '00000000-0000-0000-0000-000000000122', 'language', 'English proficiency CEFR C1 (IELTS 6.5 or TOEFL 95)', true, 'gte'::requirement_operator, '6.5', 6.5, 'ielts'),

  -- Uni Passau M.Sc. Computer Science
  ('00000000-0000-0000-0000-000000000339', '00000000-0000-0000-0000-000000000123', 'degree', 'Bachelor degree in Computer Science or closely related discipline', true, 'contains'::requirement_operator, 'Computer', NULL, NULL),
  ('00000000-0000-0000-0000-000000000340', '00000000-0000-0000-0000-000000000123', 'grade', 'Minimum German grade equivalent of 2.7 or better', true, 'lte'::requirement_operator, '2.7', 2.7, 'german_grade'),
  ('00000000-0000-0000-0000-000000000341', '00000000-0000-0000-0000-000000000123', 'language', 'English proficiency CEFR B2 (IELTS 6.0 or TOEFL 80)', true, 'gte'::requirement_operator, '6.0', 6.0, 'ielts'),

  -- Uni Hamburg M.Sc. Intelligent Adaptive Systems
  ('00000000-0000-0000-0000-000000000342', '00000000-0000-0000-0000-000000000124', 'degree', 'Bachelor degree in Computer Science or closely related computing field', true, 'contains'::requirement_operator, 'Computer', NULL, NULL),
  ('00000000-0000-0000-0000-000000000343', '00000000-0000-0000-0000-000000000124', 'language', 'English proficiency IELTS 6.5 (min 6.0 per component) or TOEFL 90', true, 'gte'::requirement_operator, '6.5', 6.5, 'ielts')
ON CONFLICT (id) DO NOTHING;
