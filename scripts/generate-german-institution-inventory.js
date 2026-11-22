// Regenerates the full institution inventory and its Supabase migration from the supplied CSV.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const universityUrls = require('./university-urls');

const root = path.join(__dirname, '..');
const csvFile = path.join(root, 'data', 'germany_higher_education_institutions_2026-11-21.csv');
const csv = fs.readFileSync(csvFile, 'utf8').replace(/^\uFEFF/, '');

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted && ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); if (row.some(value => value.trim())) rows.push(row);
      row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift().map(value => value.trim());
  return rows.map(values => Object.fromEntries(headers.map((header, i) => [header, (values[i] || '').trim()])));
}

const records = parseCsv(csv);
const required = ['Institution ID', 'Official institution name', 'Federal state', 'Federal state code', 'City (head office / primary legal seat)'];
const seen = new Set();
for (const item of records) {
  for (const field of required) if (!item[field]) throw new Error(`Missing ${field} on a CSV row`);
  if (seen.has(item['Institution ID'])) throw new Error(`Duplicate institution ID ${item['Institution ID']}`);
  seen.add(item['Institution ID']);
}
const existingNames = {
  'DE-BY-040': 'Technical University of Munich (TUM)',
  'DE-NW-048': 'RWTH Aachen University',
  'DE-BE-032': 'Technical University of Berlin (TU Berlin)',
  'DE-BW-049': 'Heidelberg University',
  'DE-BW-066': 'University of Stuttgart',
  'DE-BW-040': 'Karlsruhe Institute of Technology (KIT)',
  'DE-HE-032': 'Technical University of Darmstadt',
};
const existingIds = {
  'DE-BY-040': 'uni-tum',
  'DE-NW-048': 'uni-rwth',
  'DE-BE-032': 'uni-tub',
  'DE-BW-049': 'uni-heidelberg',
  'DE-BW-066': 'uni-stuttgart',
  'DE-BW-040': 'uni-kit',
  'DE-HE-032': 'uni-darmstadt',
};

const q = value => JSON.stringify(value || '');
const asUrl = value => /^https?:\/\//i.test(value || '') ? value : '';
const ts = `// Auto-generated from the user's master CSV. Do not edit by hand.
// The CSV labels these records provisional; institution and programme details require verification.
import type { DemoUniversity } from './demo-data';

export const CSV_UNIVERSITIES: DemoUniversity[] = ${JSON.stringify(records.map(r => {
  const ownership = r['Ownership'];
  const urls = universityUrls[r['Institution ID']] || {};
  const website = r['Official website'] || urls.web || '';
  return {
    id: existingIds[r['Institution ID']] || `uni-csv-${r['Institution ID'].toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: `${r['Official institution name']}${r['Common abbreviation'] ? ` (${r['Common abbreviation']})` : ''}`,
    country: 'Germany',
    city: r['City (head office / primary legal seat)'],
    institutionType: ['Public', 'Federal'].includes(ownership) ? 'public' : 'private',
    officialWebsite: website || '',
    admissionsWebsite: asUrl(r['International admissions page']) || urls.adm || '',
    isPublic: ['Public', 'Federal'].includes(ownership),
    isDemo: true,
    institutionRegistryId: r['Institution ID'],
    federalState: r['Federal state'],
    federalStateCode: r['Federal state code'],
    additionalCampuses: r['Additional campuses / locations in Germany'] ? r['Additional campuses / locations in Germany'].split(';').map(x => x.trim()).filter(Boolean) : [],
    mainCategory: r['Main category'],
    ownership,
    stateRecognition: r['State recognition'],
    degreeAwardingStatus: r['Degree-awarding status'],
    officialCoursePortal: r['Official course portal'] || urls.courses || '',
    internationalAdmissionsPage: asUrl(r['International admissions page']),
    applicationPortal: asUrl(r['Application portal']),
    tuitionStatus: r['Tuition status'],
    internationalStudentEligibility: r['International student eligibility'],
    institutionRecordStatus: r['Record status'],
    courseCatalogStatus: r['Institution ID'] === 'DE-BW-002' ? 'complete' : ['DE-BW-001', 'DE-BW-003'].includes(r['Institution ID']) ? 'partially_verified' : 'not_researched',
    researchSource: r['Research source (official / statistical)'],
    verificationDate: r['Verification date'],
  };
}), null, 2)};\n`;
fs.writeFileSync(path.join(root, 'src/lib/seed/csv-universities.ts'), ts);

const quote = value => `'${String(value || '').replace(/'/g, "''")}'`;
const fields = [
  'source_institution_id', 'name', 'country', 'city', 'institution_type', 'official_website', 'admissions_website',
  'description', 'is_public', 'federal_state', 'federal_state_code', 'additional_campuses', 'main_category', 'ownership',
  'state_recognition', 'degree_awarding_status', 'official_course_portal', 'international_admissions_page', 'application_portal',
  'tuition_status', 'international_student_eligibility', 'institution_record_status', 'course_catalog_status', 'research_source', 'verification_date',
];
const values = records.map(r => {
  const isPublic = ['Public', 'Federal'].includes(r['Ownership']);
  const id = crypto.createHash('md5').update(`unimatch-${r['Institution ID']}`).digest('hex');
  const uuid = `${id.slice(0,8)}-${id.slice(8,12)}-4${id.slice(13,16)}-8${id.slice(17,20)}-${id.slice(20,32)}`;
  const campuses = r['Additional campuses / locations in Germany'] ? r['Additional campuses / locations in Germany'].split(';').map(x => x.trim()).filter(Boolean) : [];
  const description = `${r['Institution type']} in ${r['City (head office / primary legal seat)']}, ${r['Federal state']}. Source inventory record ${r['Institution ID']}; verification status: ${r['Record status']}.`;
  const urls = universityUrls[r['Institution ID']] || {};
  const vals = [r['Institution ID'], r['Official institution name'], 'Germany', r['City (head office / primary legal seat)'], isPublic ? 'public' : 'private', asUrl(r['Official website']) || urls.web || '', asUrl(r['International admissions page']) || asUrl(r['Application portal']) || urls.adm || '', description, isPublic, r['Federal state'], r['Federal state code'], campuses, r['Main category'], r['Ownership'], r['State recognition'], r['Degree-awarding status'], asUrl(r['Official course portal']) || urls.courses || '', asUrl(r['International admissions page']), asUrl(r['Application portal']), r['Tuition status'], r['International student eligibility'], r['Record status'], 'not_researched', r['Research source (official / statistical)'], r['Verification date']];
  return `  (${quote(uuid)}, ${vals.map(v => Array.isArray(v) ? `ARRAY[${v.map(quote).join(', ')}]::TEXT[]` : typeof v === 'boolean' ? v : quote(v)).join(', ')})`;
});
const migration = `-- Full import of the supplied German higher education institution inventory (${records.length} rows).
-- Source CSV records are provisional and do not establish current programmes.
ALTER TABLE universities
  ADD COLUMN IF NOT EXISTS source_institution_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS federal_state TEXT,
  ADD COLUMN IF NOT EXISTS federal_state_code TEXT,
  ADD COLUMN IF NOT EXISTS additional_campuses TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS main_category TEXT,
  ADD COLUMN IF NOT EXISTS ownership TEXT,
  ADD COLUMN IF NOT EXISTS state_recognition TEXT,
  ADD COLUMN IF NOT EXISTS degree_awarding_status TEXT,
  ADD COLUMN IF NOT EXISTS official_course_portal TEXT,
  ADD COLUMN IF NOT EXISTS international_admissions_page TEXT,
  ADD COLUMN IF NOT EXISTS application_portal TEXT,
  ADD COLUMN IF NOT EXISTS tuition_status TEXT,
  ADD COLUMN IF NOT EXISTS international_student_eligibility TEXT,
  ADD COLUMN IF NOT EXISTS institution_record_status TEXT,
  ADD COLUMN IF NOT EXISTS course_catalog_status TEXT NOT NULL DEFAULT 'not_researched' CHECK (course_catalog_status IN ('not_researched', 'in_progress', 'partially_verified', 'complete')),
  ADD COLUMN IF NOT EXISTS research_source TEXT,
  ADD COLUMN IF NOT EXISTS verification_date DATE;

-- Attach source IDs and complete inventory metadata to earlier curated imports by exact official name.
UPDATE universities AS u SET
  source_institution_id = v.source_institution_id,
  federal_state = v.federal_state,
  federal_state_code = v.federal_state_code,
  additional_campuses = v.additional_campuses,
  main_category = v.main_category,
  ownership = v.ownership,
  state_recognition = v.state_recognition,
  degree_awarding_status = v.degree_awarding_status,
  official_course_portal = NULLIF(v.official_course_portal, ''),
  international_admissions_page = NULLIF(v.international_admissions_page, ''),
  application_portal = NULLIF(v.application_portal, ''),
  tuition_status = v.tuition_status,
  international_student_eligibility = v.international_student_eligibility,
  institution_record_status = v.institution_record_status,
  course_catalog_status = 'not_researched',
  research_source = v.research_source,
  verification_date = NULLIF(v.verification_date, '')::date
FROM (VALUES\n${records.map(r => {
  const campuses = r['Additional campuses / locations in Germany'] ? r['Additional campuses / locations in Germany'].split(';').map(x => x.trim()).filter(Boolean) : [];
  return `  (${[r['Institution ID'], r['Official institution name'], existingNames[r['Institution ID']] || '', r['Federal state'], r['Federal state code'], campuses, r['Main category'], r['Ownership'], r['State recognition'], r['Degree-awarding status'], r['Official course portal'], r['International admissions page'], r['Application portal'], r['Tuition status'], r['International student eligibility'], r['Record status'], r['Research source (official / statistical)'], r['Verification date']].map(value => Array.isArray(value) ? `ARRAY[${value.map(quote).join(', ')}]::TEXT[]` : quote(value)).join(', ')})`;
}).join(',\n')}\n) AS v(source_institution_id, name, legacy_name, federal_state, federal_state_code, additional_campuses, main_category, ownership, state_recognition, degree_awarding_status, official_course_portal, international_admissions_page, application_portal, tuition_status, international_student_eligibility, institution_record_status, research_source, verification_date)
WHERE u.country = 'Germany' AND u.source_institution_id IS NULL
  AND (lower(u.name) = lower(v.name) OR (v.legacy_name <> '' AND lower(u.name) = lower(v.legacy_name)));

INSERT INTO universities (id, ${fields.join(', ')}, status, is_demo, created_at, updated_at)
SELECT v.id::uuid, ${fields.map(f => `v.${f}`).join(', ')}, 'active', false, NOW(), NOW()
FROM (VALUES\n${values.join(',\n')}\n) AS v(id, ${fields.join(', ')})
WHERE NOT EXISTS (SELECT 1 FROM universities u WHERE u.source_institution_id = v.source_institution_id);
`;
fs.writeFileSync(path.join(root, 'supabase/migrations/006_import_full_german_institution_inventory.sql'), migration);
console.log(`Generated complete institution inventory: ${records.length} unique CSV records.`);
