import Link from 'next/link';

export function Footer({ variant = 'compact' }: { variant?: 'compact' | 'home' }) {
  if (variant === 'compact') {
    return (
      <footer className="mt-10 bg-[#10283f] px-5 py-7 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-7 border-b border-white/15 pb-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <Link href="/" className="font-serif text-2xl tracking-[-.04em] text-white">UniMatch</Link>
              <p className="mt-1.5 max-w-lg text-sm leading-5 text-white/65">Course discovery across Germany and Austria.</p>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link className="text-white/75 transition hover:text-white" href="/programmes">Programmes</Link>
              <Link className="text-white/75 transition hover:text-white" href="/matches">Matches</Link>
              <Link className="text-white/75 transition hover:text-white" href="/onboarding">Profile</Link>
            </nav>
          </div>
          <div className="flex flex-col gap-3 pt-5 text-xs leading-5 text-white/60 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-3xl">Assessments are advisory comparisons with published programme requirements. Universities make all admission decisions.</p>
            <Link className="whitespace-nowrap text-white/50 underline decoration-white/20 underline-offset-4 hover:text-white" href="/credits.html">Photograph credits · Unsplash &amp; Wikimedia Commons</Link>
            <span className="whitespace-nowrap text-white/45">© {new Date().getFullYear()} UniMatch</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#0c0d0e] px-6 pb-7 pt-14 text-white sm:px-10 sm:pt-16 lg:px-16">
      <div className="relative z-10 mx-auto grid max-w-[1440px] gap-x-10 gap-y-12 border-b border-white/15 pb-12 md:grid-cols-[1.3fr_.7fr_.7fr_1.1fr] lg:gap-x-16">
        <div className="max-w-sm">
          <Link href="/" className="font-serif text-3xl tracking-[-.06em] text-white">UniMatch</Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">Find courses that fit your academic record across universities in Germany and Austria.</p>
        </div>
        <nav aria-label="Platform links" className="space-y-3 text-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[.16em] text-white/40">Platform</h2>
          <Link className="block text-white/65 transition hover:text-white" href="/programmes">Browse programmes</Link>
          <Link className="block text-white/65 transition hover:text-white" href="/onboarding">Eligibility check</Link>
          <Link className="block text-white/65 transition hover:text-white" href="/matches">Your matches</Link>
        </nav>
        <nav aria-label="Account links" className="space-y-3 text-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[.16em] text-white/40">Your space</h2>
          <Link className="block text-white/65 transition hover:text-white" href="/dashboard">Dashboard</Link>
          <Link className="block text-white/65 transition hover:text-white" href="/shortlist">Shortlist</Link>
          <Link className="block text-white/65 transition hover:text-white" href="/login">Sign in</Link>
        </nav>
        <div>
          <h2 className="text-sm font-medium text-white">Start with your academic record</h2>
          <p className="mt-2 text-sm leading-6 text-white/50">Compare your details with published programme requirements.</p>
          <Link href="/onboarding" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold !text-[#142f4b] transition hover:bg-[#e7edf1]">Start eligibility check <span aria-hidden="true" className="ml-2">↗</span></Link>
        </div>
      </div>
      <div className="relative z-10 mx-auto grid max-w-[1440px] gap-8 py-8 text-xs leading-5 text-white/45 md:grid-cols-[1fr_auto]">
        <p className="max-w-3xl">UniMatch assessments are advisory comparisons based on student-entered information and published programme requirements. They are not admission decisions or guarantees; each university makes its own admission decisions.</p>
        <Link href="/credits.html" className="text-white/65 underline decoration-white/25 underline-offset-4 hover:text-white">Photograph credits · Unsplash &amp; Wikimedia Commons</Link>
      </div>
      <p aria-hidden="true" className="pointer-events-none select-none whitespace-nowrap font-serif text-[clamp(6rem,23vw,22rem)] leading-[.72] tracking-[-.09em] text-white/[.055]">UniMatch</p>
      <div className="relative z-10 mx-auto mt-8 flex max-w-[1440px] flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} UniMatch</span><span>Germany · Austria</span>
      </div>
    </footer>
  );
}
