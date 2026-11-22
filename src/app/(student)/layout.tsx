import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  let user: { email?: string; role?: string } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      user = { email: data.user.email, role: 'student' };
    }
  } catch (e) {
    // Guest student browsing without login
    user = null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex">
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>
        <main className="min-w-0 flex-1 px-4 pb-24 pt-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <MobileNav />
      <Footer />
    </div>
  );
}
