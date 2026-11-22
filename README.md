# UniMatch: Zero-AI University Programme Eligibility Platform (Germany & Austria)

A production-grade, 100% deterministic university programme discovery and eligibility evaluation platform designed for students seeking Bachelor's and Master's admissions in Germany and Austria (with tailored workflows for Indian applicants).

---

## 🛡️ Core Architectural Principle: STRICTLY ZERO-AI

UniMatch is built on the strict premise that **admissions decisions and curricular compatibility evaluations must never rely on probabilistic AI or black-box LLMs**.
- ❌ **No OpenAI, Gemini, Claude, or LLM APIs**
- ❌ **No Vector Embeddings or RAG retrieval**
- ❌ **No AI document extraction or hallucinated decisions**
- ❌ **No admission probability guarantees**

Every single match, ECTS credit check, grade conversion, language proficiency validation, and deadline evaluation is executed using **transparent, auditable, and testable TypeScript business logic** backed by structured relational PostgreSQL data.

---

## 🚀 Technology Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui design patterns + Lucide icons
- **Form Management & Validation**: React Hook Form + Zod v4 schemas
- **Database & Auth**: Supabase PostgreSQL (24 relational tables, RLS policies, triggers)
- **Unit Testing**: Vitest 2.x (100% test coverage for eligibility algorithms)

---

## 📁 Repository Structure

```
c:\My\study\uni-match\
├── src\
│   ├── app\
│   │   ├── (auth)\                 # Authentication flows (Login, Signup, Reset Password)
│   │   ├── (student)\              # Protected student portal
│   │   │   ├── dashboard\          # KPI status summary and quick matches
│   │   │   ├── onboarding\         # 12-step student profile onboarding wizard
│   │   │   ├── matches\            # Real-time deterministic eligibility matching
│   │   │   ├── programmes\         # Programme catalogue with URL search/filter
│   │   │   │   └── [id]\           # Side-by-side requirement evaluation view
│   │   │   ├── shortlist\          # Saved programmes management
│   │   │   ├── compare\            # 4-way side-by-side comparison matrix
│   │   │   └── applications\       # 11-stage application lifecycle tracker
│   │   ├── (admin)\                # Admin management portal
│   │   │   ├── admin\
│   │   │   │   ├── universities\   # University directory & Anabin verification
│   │   │   │   ├── programmes\     # Programme catalogue & curricular requirements
│   │   │   │   ├── verification\   # Source verification queue & 90-day staleness
│   │   │   │   ├── audit\          # Audit log trail of all requirement changes
│   │   │   │   └── seed\           # DEMO data seeder to Supabase
│   │   └── auth\callback\          # Supabase auth PKCE exchange callback
│   ├── components\
│   │   ├── ui\                     # Reusable shadcn/ui components (button, card, dialog...)
│   │   ├── shared\                 # Domain components (status badges, score gauge, rows)
│   │   ├── layout\                 # Navbar, sidebar, footer, page-header
│   │   └── onboarding\             # Step 1 through Step 12 onboarding views
│   ├── lib\
│   │   ├── eligibility\            # Pure deterministic eligibility & scoring engine
│   │   │   ├── evaluateDegree.ts   # Degree level hierarchy & keyword match
│   │   │   ├── evaluateCredits.ts  # Subject taxonomy, theory/practical, double-counting check
│   │   │   ├── evaluateSubjects.ts # Subject categorization summation
│   │   │   ├── evaluateGrade.ts    # Preserves original grade; Modified Bavarian Formula
│   │   │   ├── evaluateLanguage.ts # IELTS, TOEFL, Goethe, TestDaF, MOI waivers
│   │   │   ├── evaluateDeadline.ts # Intake status, countdown, 90-day verification check
│   │   │   ├── evaluateDocuments.ts# Mandatory document verification & APS check
│   │   │   ├── calculateCompatibility.ts # 0-100 weighted compatibility index
│   │   │   ├── explainResults.ts   # Line-by-line transparent student explanation
│   │   │   └── evaluateProgramme.ts# Recursive AND/OR condition group orchestrator
│   │   ├── seed\demo-data.ts       # 8 universities & 6 verified Master programmes
│   │   └── supabase\               # Supabase browser & SSR server client factories
│   └── public\templates\           # Downloadable CSV template for bulk subject import
└── supabase\
    └── migrations\
        └── 001_initial_schema.sql  # 24 relational tables, RLS, triggers & taxonomy seeds
```

---

## Environment Configuration

Copy `.env.example` to `.env.local` and enter your Supabase project URL and public/publishable key. `.env.local` is ignored by Git. The app uses Supabase Auth and RLS with the signed-in user; it does not need a service-role key.

## Database Setup

Apply every pending SQL file in `supabase/migrations` in numeric order. Do not rerun migrations that have already been applied. For administrator account setup, see [`supabase/ADMIN_SETUP.md`](supabase/ADMIN_SETUP.md).

## Deploying to Vercel

1. Push the project to GitHub and import that repository from Vercel's **New Project** page. Vercel detects Next.js automatically; keep the repository root as the project root and use the detected `pnpm install` and `next build` commands. [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) · [Git deployments](https://vercel.com/docs/git)
2. In **Project Settings → Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production and Preview. Use the Supabase project URL and its public/publishable client key. Never put a service-role key in browser code or Git. [Vercel environment variables](https://vercel.com/docs/environment-variables)
3. Deploy. Set the production domain as the Supabase Auth Site URL and add the production callback and password-reset URLs to Supabase's allowed redirect URLs.
4. After adding or changing Vercel variables, redeploy so the new values are included.
## 🧪 Testing the Engine

Run the Vitest test suite to verify the deterministic eligibility rules:

```bash
# Run unit tests
pnpm exec vitest run

# Watch mode during development
pnpm exec vitest
```

**Unit Test Coverage Highlights:**
- **Profile A (Direct Match)**: 180 ECTS CS degree with 92% CGPA & IELTS 7.5 matches TUM M.Sc. Informatics as `ELIGIBLE`.
- **Profile B (Credit Deficit)**: IT degree with only 12 math credits fails 20 ECTS math cutoff (`FAILED` / `NOT_ELIGIBLE`).
- **Profile C (Degree Level Ineligible)**: High school diploma attempting Master's application is blocked (`FAILED`).
- **Profile D (Language Disqualification)**: IELTS 6.0 against a strict 6.5 minimum cutoff is flagged as `FAILED`.
- **Profile E (Missing Evidence)**: Student with unverified transcripts and pending IELTS is classified as `NEEDS_VERIFICATION`, never mistakenly assumed as failed.
- **AND/OR Condition Groups**: Verified recursive evaluation of admission requirement rule groups.

---

## 💻 Development & Production Build

```bash
# Start local development server
pnpm dev

# Run TypeScript typecheck
pnpm exec tsc --noEmit

# Create optimized production build
pnpm build

# Start production server
pnpm start
```

---

## ⚖️ Legal & Admission Assessment Disclaimer

UniMatch calculates compatibility indices based strictly on published curriculum and examination regulations (*Prüfungsordnungen*).

**Important:**
- An advisory match index is **never an admission guarantee**.
- Missing student documents are classified as `NEEDS_VERIFICATION`, never confirmed rejections.
- Final admission authority resides exclusively with the respective university's admissions board (*Zulassungsausschuss*).
