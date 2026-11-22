# Admin portal setup

1. Apply any pending migrations in sequence through `012` to the Supabase project used by the app. Do not rerun migrations that have already been applied. Migration `012` adds administrator-only deletes, role protection, and the atomic catalogue CSV import RPC.
2. Create a normal account with the app's signup flow, then promote its profile from the Supabase SQL editor. Replace the email with the exact account email:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE lower(email) = lower('admin@example.com')
);
```

3. Sign in at `/admin-login`. Admin access is granted only to profiles whose role is `admin` or `editor`. Editors can view, add, and edit catalogue records; only admins can delete records and view audit history.

## CSV import

Download `admin-catalog-template.csv` from the Programmes page. Keep one institution's details the same on every row for that institution, and use one row per programme. To add several admission rules to one programme, repeat that programme's fields and add one rule per row. Leave the requirement columns empty if no official rule has been researched yet. Imports reject duplicate institutions rather than updating existing records, validate the entire file before writing, and run through one database transaction. New programmes and imported requirement rules remain drafts and are not treated as verified.

CSV imports require these columns: `institution_name`, `country`, `city`, `institution_type`, `official_website`, `programme_name`, `degree_level`, `subject_area`, `teaching_language`, and `official_programme_url`. The remaining columns are optional; the supplied template lists all supported fields. Files are limited to 500 KB to stay within the server's request-size limit. The admin page previews the parsed institutions and counts before the administrator confirms the atomic import.
