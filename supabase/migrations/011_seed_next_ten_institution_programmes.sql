-- Starter course records for the next ten institutions in the supplied
-- Baden-Württemberg inventory (DE-BW-004 through DE-BW-013).
-- These are verified official catalogue entries, not complete catalogues.
-- Keep each institution marked partially_verified until its full degree list
-- has been transcribed and checked against individual programme pages.

WITH source_catalog(source_institution_id, name, degree_level, subject_area,
  specialization, description, teaching_language, duration_semesters,
  official_programme_url, catalogue_url) AS (
  VALUES
  ('DE-BW-004', 'Betriebswirtschaftslehre', 'bachelor', 'Business and Economics', 'Bachelor of Arts (B.A.); dual study', 'DHBW lists this degree programme in its current Bachelor catalogue. The programme is delivered at participating DHBW campuses and requires a dual partner.', 'german', 6, 'https://www.dhbw.de/studienangebot/bachelor', 'https://www.dhbw.de/studienangebot/bachelor'),
  ('DE-BW-005', 'Computer Science', 'bachelor', 'Computer Science', 'Mono-Bachelor', 'Listed in the University of Tübingen official current degree-programme overview. Admission conditions and language requirements must be checked on the programme detail page.', 'german', 6, 'https://uni-tuebingen.de/studium/studienangebot/', 'https://uni-tuebingen.de/studium/studienangebot/'),
  ('DE-BW-006', 'Betriebswirtschaftslehre', 'bachelor', 'Business and Economics', 'Bachelor of Arts (B.A.); distance learning', 'EHiP currently lists this as one of its Bachelor distance-learning degree programmes. Programme includes selectable academic specialisations; these are not separate degrees.', 'german', NULL, 'https://www.ehip.eu/fernstudium/', 'https://www.ehip.eu/fernstudium/'),
  ('DE-BW-007', 'Soziale Arbeit', 'bachelor', 'Social Work', 'Bachelor of Arts (B.A.)', 'EH Freiburg lists this active full-time Bachelor programme with a seven-semester standard period and winter-semester entry.', 'german', 7, 'https://www.eh-freiburg.de/studiengaenge/', 'https://www.eh-freiburg.de/studiengaenge/'),
  ('DE-BW-008', 'Soziale Arbeit', 'master', 'Social Work', 'Master of Arts (M.A.)', 'EH Ludwigsburg lists this active three-semester Master programme. Programme detail page gives the award, study format and current application information.', 'german', 3, 'https://www.eh-ludwigsburg.de/studium/studienangebot/masterstudiengaenge/soziale-arbeit-ma', 'https://www.eh-ludwigsburg.de/studium/studienangebot/alle-studiengaenge-im-ueberblick'),
  ('DE-BW-009', 'Waldorfpädagogik', 'bachelor', 'Education', 'Bachelor of Arts (B.A.)', 'The Freie Hochschule Stuttgart lists this modularised academic degree programme in its current programme overview.', 'german', 6, 'https://www.freie-hochschule-stuttgart.de/de/hochschule/die-fhs/historie', 'https://www.freie-hochschule-stuttgart.de/de/hochschule/die-fhs/historie'),
  ('DE-BW-010', 'Artificial Intelligence and Data Science', 'bachelor', 'Computer Science', 'Bachelor of Science (B.Sc.)', 'Listed in Hochschule Aalen’s current official degree-programme catalogue. Check the detail record for the intake-specific application status.', 'english', 7, 'https://www.hs-aalen.de/studiengaenge/', 'https://www.hs-aalen.de/studiengaenge/'),
  ('DE-BW-011', 'Betriebswirtschaft', 'bachelor', 'Business and Economics', 'Bachelor programme', 'Listed as an active Bachelor degree programme in Hochschule Albstadt-Sigmaringen’s official current study catalogue.', 'german', 7, 'https://www.hs-albsig.de/studieninfos/studieninteressierte/unser-studienangebot/', 'https://www.hs-albsig.de/studieninfos/studieninteressierte/unser-studienangebot/'),
  ('DE-BW-012', 'Business Administration', 'bachelor', 'Business and Economics', 'Bachelor of Science (B.Sc.)', 'Listed in Hochschule Biberach’s 2026 Incoming Guide. Current programme structure is being reorganised; confirm the next intake and exact programme title on the live study finder.', 'english', NULL, 'https://www.hochschule-biberach.de/start_2_study', 'https://www.hochschule-biberach.de/sites/default/files/medien/dokumente/HBC_Incoming-Guide_2026.pdf'),
  ('DE-BW-013', 'Arbeitsmarktmanagement', 'bachelor', 'Business, Social Sciences and Law', 'Bachelor of Arts (B.A.); dual study', 'HdBA lists this active dual Bachelor programme at its campuses in Mannheim and Schwerin; the programme begins each September and has a three-year duration.', 'german', 6, 'https://www.hdba.de/studium/bachelorstudiengaenge/studiengang-arbeitsmarktmanagement/', 'https://uhdba.de/studium/bachelorstudiengaenge/')
), resolved AS (
  SELECT u.id AS university_id, u.source_institution_id, c.*
  FROM source_catalog c
  JOIN universities u ON u.source_institution_id = c.source_institution_id
), inserted AS (
  INSERT INTO programmes (university_id, name, degree_level, subject_area,
    specialization, description, teaching_language, duration_semesters,
    official_programme_url, status, is_demo, last_verified_at,
    requirements_data_status, requirements_data_checked_at)
  SELECT r.university_id, r.name, r.degree_level::degree_level, r.subject_area,
    r.specialization, r.description, r.teaching_language, r.duration_semesters,
    r.official_programme_url, 'published'::programme_status, false,
    NOW(), 'unknown', DATE '2026-11-22'
  FROM resolved r
  WHERE NOT EXISTS (
    SELECT 1 FROM programmes p
    WHERE p.university_id = r.university_id
      AND (p.official_programme_url = r.official_programme_url OR p.name = r.name)
  )
  RETURNING id, university_id, name, official_programme_url
)
INSERT INTO programme_sources (programme_id, url, source_title, date_accessed,
  verification_status, notes)
SELECT i.id, r.catalogue_url,
  'Official university degree-programme catalogue', DATE '2026-11-22',
  'verified',
  'Confirms this degree is listed in the official catalogue. This catalogue-level source does not verify programme-specific admission rules, intake availability, or an individual admission probability.'
FROM inserted i
JOIN resolved r ON r.university_id = i.university_id AND r.name = i.name
WHERE NOT EXISTS (
  SELECT 1 FROM programme_sources ps
  WHERE ps.programme_id = i.id AND ps.url = r.catalogue_url
);

-- Store the official catalogue URL and explicitly leave each institution's
-- catalogue incomplete until all current degree programmes are individually
-- captured. Do not infer eligibility from catalogue membership.
UPDATE universities AS u
SET official_course_portal = x.catalogue_url,
    course_catalog_status = 'partially_verified',
    research_source = x.catalogue_url,
    verification_date = DATE '2026-11-22',
    updated_at = NOW()
FROM (VALUES
  ('DE-BW-004', 'https://www.dhbw.de/studienangebot/bachelor'),
  ('DE-BW-005', 'https://uni-tuebingen.de/studium/studienangebot/'),
  ('DE-BW-006', 'https://www.ehip.eu/fernstudium/'),
  ('DE-BW-007', 'https://www.eh-freiburg.de/studiengaenge/'),
  ('DE-BW-008', 'https://www.eh-ludwigsburg.de/studium/studienangebot/alle-studiengaenge-im-ueberblick'),
  ('DE-BW-009', 'https://www.freie-hochschule-stuttgart.de/de/hochschule/die-fhs/historie'),
  ('DE-BW-010', 'https://www.hs-aalen.de/studiengaenge/'),
  ('DE-BW-011', 'https://www.hs-albsig.de/studieninfos/studieninteressierte/unser-studienangebot/'),
  ('DE-BW-012', 'https://www.hochschule-biberach.de/start_2_study'),
  ('DE-BW-013', 'https://uhdba.de/studium/bachelorstudiengaenge/')
) AS x(source_institution_id, catalogue_url)
WHERE u.source_institution_id = x.source_institution_id;
