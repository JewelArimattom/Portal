import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f7f7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 font-serif font-semibold text-3xl text-[#142f4b] tracking-[-.055em]">
          <span>UniMatch</span>
        </Link>
        <p className="mt-2 text-xs text-slate-500 font-medium">
          Germany & Austria University Programme Eligibility Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-[0_18px_60px_rgba(20,47,75,.07)] border border-slate-200 rounded-2xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
