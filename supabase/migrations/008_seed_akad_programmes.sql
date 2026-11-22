-- Official AKAD University degree catalogue batch, generated 2026-11-21.
-- Each row links to an individual official programme page discovered from the faculty catalogue.
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS tuition_fee_status TEXT
  CHECK (tuition_fee_status IS NULL OR tuition_fee_status IN ('known', 'unknown', 'not_applicable'));

UPDATE programmes p
SET tuition_fee_status = 'unknown'
FROM universities u
WHERE u.id = p.university_id AND u.source_institution_id = 'DE-BW-003'
  AND p.official_programme_url LIKE 'https://www.allensbach-hochschule.de/%'
  AND p.tuition_fee_status IS NULL;

WITH source_catalog(name, degree_level, official_programme_url) AS (
  VALUES
  ('Betriebswirtschaftslehre – Accounting und Taxation (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/betriebswirtschaftslehre-accounting-und-taxation-ba/'),
  ('Betriebswirtschaftslehre (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/betriebswirtschaftslehre-ba/'),
  ('Betriebswirtschaftslehre - Banking und Finance (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/betriebswirtschaftslehre-banking-und-finance-ba/'),
  ('Controlling (B.Sc.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/controlling-bsc/'),
  ('Data Science (B.Sc.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/data-science-bsc/'),
  ('Dienstleistungsmanagement (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/dienstleistungsmanagement-ba/'),
  ('Digital Business (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/digital-business-ba/'),
  ('Digital Engineering und Angewandte Informatik (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/digital-engineering-und-angewandte-informatik-beng/'),
  ('Digital Leadership (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/digital-leadership-ba/'),
  ('Elektro- und Informationstechnik (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/elektro-und-informationstechnik-beng/'),
  ('Elektrotechnik (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/elektrotechnik-beng/'),
  ('Ernährungswissenschaften (B.Sc.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/ernaehrungswissenschaften-bsc/'),
  ('Fachübersetzen Technik (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/fachuebersetzen-technik-ba/'),
  ('Fachübersetzen Wirtschaft (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/fachuebersetzen-wirtschaft-ba/'),
  ('Fahrzeugtechnik (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/fahrzeugtechnik-beng/'),
  ('Gesundheitsmanagement (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/gesundheitsmanagement-ba/'),
  ('Gesundheitspädagogik (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/gesundheitspaedagogik-ba/'),
  ('Heilpädagogik (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/heilpaedagogik-ba/'),
  ('Informatik (B.Sc.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/informatik-bsc/'),
  ('International Business Communication (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/international-business-communication-ba/'),
  ('International Management (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/international-management-ba/'),
  ('KI im Management (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/ki-im-management-ba/'),
  ('Kindheitspädagogik (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/kindheitspaedagogik-ba/'),
  ('Logistikmanagement (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/logistikmanagement-ba/'),
  ('Marketing (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/marketing-ba/'),
  ('Maschinenbau (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/maschinenbau-beng/'),
  ('Mechatronik (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/mechatronik-beng/'),
  ('Mechatronik – Robotik und Automatisierung (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/mechatronik-robotik-und-automatisierung-beng/'),
  ('Online Marketing (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/online-marketing-ba/'),
  ('Personalmanagement (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/personalmanagement-ba/'),
  ('Pflegemanagement (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/pflegemanagement-ba/'),
  ('Pflegepädagogik (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/pflegepaedagogik-ba/'),
  ('Psychologie (B.Sc.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/psychologie-bsc/'),
  ('Software Engineering (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/software-engineering-beng/'),
  ('Soziale Arbeit (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/soziale-arbeit-ba/'),
  ('Sozialmanagement (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/sozialmanagement-ba/'),
  ('Sportmanagement (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/sportmanagement-ba/'),
  ('Technische Betriebswirtschaftslehre (B.Sc.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/technische-betriebswirtschaftslehre-bsc/'),
  ('Verfahrenstechnik (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/verfahrenstechnik-beng/'),
  ('Wirtschaftsinformatik (B.Sc.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/wirtschaftsinformatik-bsc/'),
  ('Wirtschaftsingenieurwesen (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/wirtschaftsingenieurwesen-beng/'),
  ('Wirtschaftsingenieurwesen Energiesysteme mit Erneuerbaren Energien (B.Eng.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/wirtschaftsingenieurwesen-energiesysteme-mit-erneuerbaren-energien-beng/'),
  ('Wirtschaftspsychologie (B.Sc.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/wirtschaftspsychologie-bsc/'),
  ('Wirtschaftswissenschaften (B.A.)', 'bachelor', 'https://www.akad.de/abschluss/bachelor/wirtschaftswissenschaften-ba/'),
  ('Betriebswirtschaftslehre (M.A.)', 'master', 'https://www.akad.de/abschluss/master/betriebswirtschaftslehre-ma/'),
  ('Controlling (M.Sc.)', 'master', 'https://www.akad.de/abschluss/master/controlling-msc/'),
  ('Data Science (M.Sc.)', 'master', 'https://www.akad.de/abschluss/master/data-science-msc/'),
  ('Digital Business Management (M.A.)', 'master', 'https://www.akad.de/abschluss/master/digital-business-management-ma/'),
  ('Digital Health (M.A.)', 'master', 'https://www.akad.de/abschluss/master/digital-health-ma/'),
  ('Elektrotechnik (M.Eng)', 'master', 'https://www.akad.de/abschluss/master/elektrotechnik-meng/'),
  ('Gesundheitsmanagement (M.A.)', 'master', 'https://www.akad.de/abschluss/master/gesundheitsmanagement-ma/'),
  ('Global Management und Communication (M.A.)', 'master', 'https://www.akad.de/abschluss/master/global-management-und-communication-ma/'),
  ('Informatik (M.Sc.)', 'master', 'https://www.akad.de/abschluss/master/informatik-msc/'),
  ('Künstliche Intelligenz (M.Sc.)', 'master', 'https://www.akad.de/abschluss/master/kuenstliche-intelligenz-msc/'),
  ('Maschinenbau (M.Eng.)', 'master', 'https://www.akad.de/abschluss/master/maschinenbau-meng/'),
  ('Mechatronik (M.Eng.)', 'master', 'https://www.akad.de/abschluss/master/mechatronik-meng/'),
  ('Nachhaltigkeit und Systemisches Management (M.Sc.)', 'master', 'https://www.akad.de/abschluss/master/nachhaltigkeit-und-systemisches-management-msc/'),
  ('Online Marketing (M.A.)', 'master', 'https://www.akad.de/abschluss/master/online-marketing-ma/'),
  ('Projektmanagement (M.A.)', 'master', 'https://www.akad.de/abschluss/master/projektmanagement-ma/'),
  ('Technologie- und Innovationsmanagement (M.Sc.)', 'master', 'https://www.akad.de/abschluss/master/technologie-und-innovationsmanagement-msc/'),
  ('Wirtschaftsinformatik und IT-Management (M.Sc.)', 'master', 'https://www.akad.de/abschluss/master/wirtschaftsinformatik-und-it-management-msc/'),
  ('Wirtschaftsingenieurwesen (M.Eng.)', 'master', 'https://www.akad.de/abschluss/master/wirtschaftsingenieurwesen-meng/'),
  ('Digital Management und Leadership (MBA)', 'master', 'https://www.akad.de/abschluss/mba/digital-management-und-leadership-mba/'),
  ('Entrepreneurship und Innovation (MBA)', 'master', 'https://www.akad.de/abschluss/mba/entrepreneurship-und-innovation-mba/'),
  ('General Management (MBA)', 'master', 'https://www.akad.de/abschluss/mba/general-management-mba/'),
  ('Medical Leadership (MBA)', 'master', 'https://www.akad.de/abschluss/mba/medical-leadership-mba/'),
  ('Personalmanagement (MBA)', 'master', 'https://www.akad.de/abschluss/mba/personalmanagement-mba/')
), target AS (
  SELECT u.id AS university_id, s.name, s.degree_level::degree_level, s.official_programme_url
  FROM source_catalog s
  JOIN universities u ON u.source_institution_id = 'DE-BW-001'
)
INSERT INTO programmes (university_id, name, degree_level, teaching_language, official_programme_url,
  application_method, status, is_demo, last_verified_at, tuition_fee_status)
SELECT t.university_id, t.name, t.degree_level, 'unknown', t.official_programme_url,
  'direct', 'published', false, DATE '2026-11-21', 'unknown'
FROM target t
WHERE NOT EXISTS (
  SELECT 1 FROM programmes p
  WHERE p.university_id = t.university_id AND p.official_programme_url = t.official_programme_url
);

INSERT INTO programme_sources (programme_id, url, source_title, date_accessed, verification_status, notes)
SELECT p.id, p.official_programme_url, 'AKAD University official programme page', DATE '2026-11-21',
  'verified', 'Individual programme page linked from the official AKAD faculty catalogue; page response and AKAD identity checked during import.'
FROM programmes p
JOIN universities u ON u.id = p.university_id
WHERE u.source_institution_id = 'DE-BW-001'
  AND p.official_programme_url LIKE 'https://www.akad.de/abschluss/%'
  AND NOT EXISTS (
    SELECT 1 FROM programme_sources ps
    WHERE ps.programme_id = p.id AND ps.url = p.official_programme_url
  );

UPDATE universities
SET course_catalog_status = 'partially_verified',
    official_course_portal = 'https://www.akad.de/fakultaet-technik-informatik/'
WHERE source_institution_id = 'DE-BW-001';
