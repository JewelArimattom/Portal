import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { MatchesExperience } from './matches-experience';

export default function MatchesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <PageHeader
        title="Your programme matches"
        description="See how your academic record compares with published university requirements."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Eligibility Matches' },
        ]}
        actions={
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button variant="outline" className="min-h-11 w-full border-[#9fb2bf] px-4 text-sm font-semibold text-[#173b5b] hover:bg-[#f2f6f8] sm:w-auto">
              Update profile
            </Button>
          </Link>
        }
      />
      <MatchesExperience />
    </div>
  );
}
