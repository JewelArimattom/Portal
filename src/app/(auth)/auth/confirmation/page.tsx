import Link from 'next/link';
import { AlertCircle, ArrowLeft, MailWarning } from 'lucide-react';

export default async function EmailConfirmationPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const expired = status === 'expired';

  return (
    <div className="space-y-6 text-center">
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${expired ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'}`}>
        {expired ? <MailWarning aria-hidden="true" className="h-7 w-7" /> : <AlertCircle aria-hidden="true" className="h-7 w-7" />}
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#142f4b]">
          {expired ? 'This email link has expired' : 'We could not verify your email'}
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-6 text-slate-600">
          {expired
            ? 'The link may have expired or already been used. Return to sign up to request a fresh verification email. If you have already verified your address, you can sign in.'
            : 'The verification link could not be completed. Try again from your email, or return to sign up to request a new one.'}
        </p>
      </div>
      <div className="space-y-3 pt-1">
        <Link href="/signup" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#173b5b] px-4 text-sm font-medium text-white transition-colors hover:bg-[#102c45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173b5b] focus-visible:ring-offset-2">Return to sign up</Link>
        <Link href="/login" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#173b5b] underline-offset-4 hover:underline">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />Go to sign in
        </Link>
      </div>
    </div>
  );
}
