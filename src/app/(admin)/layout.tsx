import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin-login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/admin-login?unauthorized=1');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar user={{ email: user.email, role: profile.role }} />
      <nav aria-label="Admin navigation" className="grid grid-cols-3 gap-2 border-b border-slate-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700 lg:hidden">
        <Link href="/admin" className="rounded-lg px-2 py-2 hover:bg-slate-100">Overview</Link>
        <Link href="/admin/universities" className="rounded-lg px-2 py-2 hover:bg-slate-100">Institutions</Link>
        <Link href="/admin/programmes" className="rounded-lg px-2 py-2 hover:bg-slate-100">Programmes</Link>
      </nav>
      <div className="flex-1 flex">
        <div className="hidden shrink-0 lg:block"><AdminSidebar /></div>
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
