-- Official catalogue research for Allensbach Hochschule (DE-BW-003).
-- The institution's official site currently lists six programmes in its catalogue overview,
-- while also listing the English MBA separately. Keep coverage partial until the discrepancy
-- and every current programme page have been reconciled.

WITH catalog(university_id, name, degree_level, subject_area, specialization, description,
  teaching_language, duration_semesters, official_programme_url, official_application_url) AS (
  SELECT u.id, p.name, p.degree_level::degree_level, p.subject_area, p.specialization,
    p.description, p.teaching_language, p.duration_semesters, p.official_programme_url,
    'https://application.allensbach-hochschule.de/'
  FROM universities u
  CROSS JOIN (VALUES
    ('Betriebswirtschaftslehre (B.A.)', 'bachelor', 'Business Administration',
      '13 selectable study specializations', 'Online Bachelor of Arts in Business Administration. The official page lists 13 selectable specializations and says the programme is currently taught in German.',
      'german', 6, 'https://www.allensbach-hochschule.de/bachelor/'),
    ('Business Management (M.A.)', 'master', 'Business Administration',
      'Digital Business Management; International Business; Personal Management; PR and Communication; Sales and Marketing; Business Psychology',
      'Distance-learning Master of Arts in Business Management; the official page states 120 ECTS and an English-language offer from July 2026.',
      'both', 4, 'https://www.allensbach-hochschule.de/master/betriebswirtschaft-und-management/'),
    ('Finance (M.Sc.)', 'master', 'Finance', 'Banking; Wealth Management and Private Banking; Accounting and Taxation',
      'Distance-learning Master of Science in Finance, available in German and English according to the official programme page.',
      'both', NULL, 'https://www.allensbach-hochschule.de/master/finance/'),
    ('MBA General Management', 'master', 'Business Administration', 'Optional specializations; 90 or 120 ECTS variants',
      'Distance-learning Master of Business Administration in General Management. The official page lists multiple credit and duration variants.',
      'german', NULL, 'https://www.allensbach-hochschule.de/master/mba-general-management/'),
    ('MBA General Management – Executive variant (60 ECTS)', 'master', 'Business Administration', 'Optional specializations',
      'Executive distance-learning MBA variant with a stated standard duration of 12 months and year-round start according to the official page.',
      'german', 2, 'https://www.allensbach-hochschule.de/master/mba-in-12-monaten/'),
    ('MBA General Management (English)', 'master', 'Business Administration', '12 optional specializations',
      'English-language online MBA in General Management. The official page lists an 18-month standard duration without specialization and a 24-month duration with specialization.',
      'english', NULL, 'https://www.allensbach-hochschule.de/master/online-mba-in-english-language/'),
    ('Wirtschaftspädagogik (M.A.)', 'master', 'Business Education', 'Business education; economics; 11 selectable specializations',
      'Distance-learning Master of Arts in Business Education. The official page states a 24-month standard duration and also identifies the Magister Artium award as an alternative.',
      'german', 4, 'https://www.allensbach-hochschule.de/master/wirtschaftspaedagogik/')
  ) AS p(name, degree_level, subject_area, specialization, description, teaching_language,
    duration_semesters, official_programme_url)
  WHERE u.source_institution_id = 'DE-BW-003'
)
INSERT INTO programmes (university_id, name, degree_level, subject_area, specialization, description,
  teaching_language, duration_semesters, official_programme_url, official_application_url,
  application_method, status, is_demo, last_verified_at)
SELECT c.university_id, c.name, c.degree_level, c.subject_area, c.specialization, c.description,
  c.teaching_language, c.duration_semesters, c.official_programme_url, c.official_application_url,
  'direct', 'published', false, DATE '2026-11-21'
FROM catalog c
WHERE NOT EXISTS (
  SELECT 1 FROM programmes p
  WHERE p.university_id = c.university_id AND p.name = c.name
);

INSERT INTO programme_sources (programme_id, url, source_title, date_accessed,
  verification_status, notes)
SELECT p.id, p.official_programme_url, 'Official Allensbach Hochschule programme page',
  DATE '2026-11-21', 'verified', 'Programme title and active catalogue listing checked against the institution website.'
FROM programmes p
JOIN universities u ON u.id = p.university_id
WHERE u.source_institution_id = 'DE-BW-003'
  AND p.official_programme_url LIKE 'https://www.allensbach-hochschule.de/%'
  AND NOT EXISTS (
    SELECT 1 FROM programme_sources ps
    WHERE ps.programme_id = p.id AND ps.url = p.official_programme_url
  );

UPDATE universities
SET course_catalog_status = 'partially_verified'
WHERE source_institution_id = 'DE-BW-003';
