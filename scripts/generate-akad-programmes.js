// Discovers AKAD's degree programmes from the official faculty catalogue and creates
// an idempotent migration with official detail-page URLs. Certificates are excluded.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const catalogueUrl = 'https://www.akad.de/fakultaet-technik-informatik/';
const today = '2026-11-21';
const esc = value => String(value).replace(/'/g, "''");
const decode = value => value
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
  .replace(/&#039;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const cleanText = value => decode(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

async function main() {
  const catalogueResponse = await fetch(catalogueUrl);
  if (!catalogueResponse.ok) throw new Error(`Catalogue request failed: ${catalogueResponse.status}`);
  const html = await catalogueResponse.text();
  const courses = new Map();
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gis)) {
    const url = decode(match[1]);
    if (!/^https:\/\/www\.akad\.de\/abschluss\/(bachelor|master|mba)\//i.test(url)) continue;
    const rawTitle = cleanText(match[2]).replace(/^ai\s+/i, '');
    if (!/\((?:B\.[A-Za-z]+\.?|M\.[A-Za-z]+\.?|MBA)\)\s*$/i.test(rawTitle)) continue;
    const name = rawTitle
      .replace(/^Bachelor of (?:Arts|Science|Engineering)\s+/i, '')
      .replace(/^Master of (?:Arts|Science|Engineering)\s+/i, '')
      .trim();
    courses.set(url, { name, url, level: /\/abschluss\/bachelor\//i.test(url) ? 'bachelor' : 'master' });
  }
  if (courses.size < 50) throw new Error(`Expected a broad degree list; found only ${courses.size}: ${JSON.stringify([...courses.values()].slice(0, 10))}`);

  const list = [...courses.values()].sort((a, b) => a.url.localeCompare(b.url));
  let cursor = 0;
  const failures = [];
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (cursor < list.length) {
      const item = list[cursor++];
      try {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const page = await response.text();
        if (!/AKAD University/i.test(page) || !/<h1\b/i.test(page)) throw new Error('No AKAD programme page heading found');
        item.pageVerified = true;
      } catch (error) {
        failures.push(`${item.url}: ${error.message}`);
      }
    }
  }));
  const verified = list.filter(item => item.pageVerified);
  if (!verified.length) throw new Error(`No programme detail pages verified. ${failures.slice(0, 5).join('; ')}`);

  const values = verified.map(item => `  (${[
    item.name, item.level, item.url,
  ].map(value => `'${esc(value)}'`).join(', ')})`).join(',\n');
  const sql = `-- Official AKAD University degree catalogue batch, generated ${today}.
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
  VALUES\n${values}\n), target AS (
  SELECT u.id AS university_id, s.name, s.degree_level::degree_level, s.official_programme_url
  FROM source_catalog s
  JOIN universities u ON u.source_institution_id = 'DE-BW-001'
)
INSERT INTO programmes (university_id, name, degree_level, teaching_language, official_programme_url,
  application_method, status, is_demo, last_verified_at, tuition_fee_status)
SELECT t.university_id, t.name, t.degree_level, 'unknown', t.official_programme_url,
  'direct', 'published', false, DATE '${today}', 'unknown'
FROM target t
WHERE NOT EXISTS (
  SELECT 1 FROM programmes p
  WHERE p.university_id = t.university_id AND p.official_programme_url = t.official_programme_url
);

INSERT INTO programme_sources (programme_id, url, source_title, date_accessed, verification_status, notes)
SELECT p.id, p.official_programme_url, 'AKAD University official programme page', DATE '${today}',
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
    official_course_portal = '${esc(catalogueUrl)}'
WHERE source_institution_id = 'DE-BW-001';
`;
fs.writeFileSync(path.join(root, 'supabase/migrations/008_seed_akad_programmes.sql'), sql);
console.log(`AKAD: ${verified.length}/${list.length} individual official degree pages responded and identified AKAD.`);
if (failures.length) console.log(`Unverified pages skipped: ${failures.length}`);
for (const item of verified) console.log(`${item.level}\t${item.name}\t${item.url}`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
