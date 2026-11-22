# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

International students assessing their eligibility for Bachelor’s and Master’s programmes at universities in Germany and Austria.

## Product Purpose

UniMatch helps students compare their academic records and application readiness with published university programme requirements. Success means students can understand how their records align, identify gaps and verification needs, and build a programme shortlist before applying.

## Positioning

UniMatch uses deterministic, rule-based evaluation to show how student records map to published requirements. It explains individual checks instead of estimating admission probability or presenting an opaque recommendation.

## Operating Context

Students enter degree, semester-wise subjects, credits, grades, language results, and supporting-document status; review requirement-by-requirement matches; compare and shortlist programmes; and track application milestones. University requirement data is maintained against official sources and may need periodic verification.

## Capabilities and Constraints

- Programme catalogue and filters, student profile onboarding, eligibility evaluation, transparent result explanations, shortlist and comparison, and application tracking.
- Eligibility outcomes distinguish unmet requirements from information or evidence that still needs verification.
- Compatibility scores indicate structural alignment with requirements and are not probabilities or admission guarantees.
- The current implementation targets Germany and Austria and includes Indian UGC/AICTE credit mapping and APS guidance. Support for other educational systems is not established by the repository and remains an open product decision.
- Final admission decisions belong to each university’s admissions authority.

## Evidence on Hand

- Eligibility rules and evaluation code in `src/lib/eligibility/`.
- Database schema and row-level security policies in `supabase/migrations/001_initial_schema.sql`.
- Demo seed data in `src/lib/seed/demo-data.ts`.
- The repository describes official university regulations as the basis for requirements; each programme’s live source coverage and freshness should be verified before making coverage claims.
- Do not fabricate admissions outcomes, university endorsements, customer testimonials, or verified coverage beyond the available programme records.

## Product Principles

- Show the requirement and the student evidence behind each result.
- Keep unmet requirements distinct from missing or unverified evidence.
- Treat official university sources as the authority for programme requirements.
- Make uncertainty and the limits of compatibility scores clear.
- Preserve students’ original academic records when calculating equivalencies.
