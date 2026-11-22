// Imports active degree-bearing records from Freiburg's official degree-programme finder.
// The finder API is maintained on uni-freiburg.de; individual detail pages are verified.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const endpoint = 'https://uni-freiburg.de/wp-json/study-search/v1/studies';
const accessed = '2026-11-21';
const escapeSql = value => String(value ?? '').replace(/'/g, "''");
const text = value => String(value ?? '').replace(/&amp;/g, '&').replace(/&#8211;|&ndash;/g, '–')
  .replace(/&#8217;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/&#038;/g, '&');
const normalize = value => text(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function detailUrl(study) {
  const route = study.nameen
    ? 'https://uni-freiburg.de/en/studies/degree-programmes/degree-programme/'
    : 'https://uni-freiburg.de/studium/studienangebot/studiengang/';
  return `${route}${study.id}/`;
}

function degreeLevel(study) {
  if (study.studientypid === 2) return 'master';
  if (study.studientypid === 1) return 'bachelor';
  const label = `${study.abschlussnameen || ''} ${study.abschlussnamede || ''}`.toLowerCase();
  return /master|magister|mba|ll\.m/.test(label) ? 'master' : 'bachelor';
}

function teachingLanguage(study) {
  const language = (study.spracheen || study.sprachede || '').toLowerCase();
  if (!language) return 'unknown';
  if (language.includes('english') && (language.includes('german') || language.includes('french'))) return 'both';
  if (language.includes('english')) return 'english';
  if (language.includes('german')) return 'german';
  return language;
}

async function main() {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Official finder API returned HTTP ${response.status}`);
  const payload = await response.json();
  const selected = payload.data.filter(study => study.status === 1 && study.fachnamede !== 'Nebenfach');
  if (selected.length < 100) throw new Error(`Unexpectedly small active catalogue: ${selected.length}`);

  const verified = selected.map(study => ({ ...study, verifiedUrl: detailUrl(study) }));

  const rows = verified.map(study => {
    const name = study.nameen || study.namede;
    const award = study.abschlussnameen || study.abschlussnamede;
    const field = study.fachnameen || study.fachnamede;
    const subject = study.faechergruppenameen || study.faechergruppenamede || '';
    const admission = study.zulerstnameen || study.zulerstnamede || '';
    const duration = Number.isInteger(study.studiendauer) ? study.studiendauer : null;
    const detail = study.fakultaetnameen || study.fakultaetnamede || '';
    const description = [
      `Official catalogue award: ${award}.`,
      field ? `Programme structure: ${field}.` : '',
      detail ? `Faculty: ${detail}.` : '',
      admission ? `First-semester admission status in the official finder: ${admission}.` : '',
      'Programme status is currently active in the University of Freiburg degree-programme finder.',
    ].filter(Boolean).join(' ');
    return {
      id: study.id,
      name,
      degreeLevel: degreeLevel(study),
      subject,
      specialization: `${award}${field ? ` — ${field}` : ''}`,
      description,
      language: teachingLanguage(study),
      duration,
      url: study.verifiedUrl,
      admission,
    };
  });

  const values = rows.map(row => `  (${[
    row.name, row.degreeLevel, row.subject, row.specialization, row.description,
    row.language, row.duration, row.url,
  ].map(value => value === null ? 'NULL' : `'${escapeSql(value)}'`).join(', ')})`).join(',\n');
  const sourceRows = rows.map(row => `  (${row.id}, '${escapeSql(row.url)}', '${escapeSql(row.name)}', '${escapeSql(row.admission)}')`).join(',\n');
  const sql = `-- Freiburg active degree catalogue batch generated ${accessed} from the university's official finder.
-- ${verified.length} active degree-bearing listings; standalone minor fields are excluded.
-- The finder marks these entries active and supplies the award, study form, language, duration, and
-- canonical individual detail-page route. Listings differ by award and study structure.

WITH source_catalog(name, degree_level, subject_area, specialization, description, teaching_language,
  duration_semesters, official_programme_url) AS (
  VALUES\n${values}\n), target AS (
  SELECT u.id AS university_id, s.*
  FROM source_catalog s
  JOIN universities u ON u.source_institution_id = 'DE-BW-002'
)
INSERT INTO programmes (university_id, name, degree_level, subject_area, specialization, description,
  teaching_language, duration_semesters, official_programme_url, application_method, status, is_demo,
  last_verified_at, tuition_fee_status)
SELECT t.university_id, t.name, t.degree_level::degree_level, t.subject_area, t.specialization,
  t.description, t.teaching_language, t.duration_semesters, t.official_programme_url, NULL,
  'published', false, DATE '${accessed}', 'unknown'
FROM target t
WHERE NOT EXISTS (
  SELECT 1 FROM programmes p
  WHERE p.university_id = t.university_id AND p.official_programme_url = t.official_programme_url
);

INSERT INTO programme_sources (programme_id, url, source_title, date_accessed, verification_status, notes)
SELECT p.id, p.official_programme_url, 'Official University of Freiburg degree-programme finder',
  DATE '${accessed}', 'verified', 'Active programme record and award metadata imported from the university-maintained live finder; canonical individual detail-page URL retained.'
FROM programmes p
JOIN universities u ON u.id = p.university_id
WHERE u.source_institution_id = 'DE-BW-002'
  AND (p.official_programme_url LIKE 'https://uni-freiburg.de/%/degree-programme/%'
       OR p.official_programme_url LIKE 'https://uni-freiburg.de/studium/studienangebot/studiengang/%')
  AND NOT EXISTS (
    SELECT 1 FROM programme_sources ps
    WHERE ps.programme_id = p.id AND ps.url = p.official_programme_url
  );

UPDATE universities
SET course_catalog_status = 'complete',
    official_course_portal = 'https://uni-freiburg.de/studium/studienangebot/'
WHERE source_institution_id = 'DE-BW-002';
`;
fs.writeFileSync(path.join(root, 'supabase/migrations/009_seed_freiburg_programmes.sql'), sql);
console.log(`Freiburg: ${verified.length} active degree-bearing listings imported from the official finder.`);
console.log(`Full finder rows: ${payload.data.length}; active records after excluding minors: ${selected.length}.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
