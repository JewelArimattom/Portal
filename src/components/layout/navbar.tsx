'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth/actions';

interface NavbarProps { user?: { email?: string; role?: string } | null }

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const canManageAdmin = user?.role === 'admin' || user?.role === 'editor';
  const links = [
    { label: 'Programmes', href: '/programmes' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Eligibility matches', href: '/matches' },
    { label: 'Shortlist', href: '/shortlist' },
    { label: 'Applications', href: '/applications' },
    { label: 'Profile', href: '/onboarding' },
    ...(canManageAdmin ? [{ label: 'Admin portal', href: '/admin' }] : []),
  ];
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-serif text-[26px] font-semibold tracking-[-.055em] text-[#142f4b]">UniMatch<span className="ml-2 align-middle font-sans text-[9px] font-semibold uppercase tracking-[.16em] text-slate-500">DE · AT</span></Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-[13px] font-medium lg:flex">
          {links.filter((link) => ['Programmes', 'Dashboard', 'Eligibility matches'].includes(link.label)).map((link) => <Link key={link.href} href={link.href} className={cn('transition-colors hover:text-[#173b5b]', pathname === link.href || pathname.startsWith(`${link.href}/`) ? 'text-[#173b5b]' : 'text-slate-600')}>{link.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          {user ? <>{canManageAdmin && <Link href="/admin" className="text-xs font-semibold text-[#173b5b]">Admin portal</Link>}<Link href="/onboarding" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500">My profile</Link><form action={signOut}><Button variant="ghost" size="sm" className="text-slate-600"><LogOut className="mr-1.5 h-4 w-4" />Sign out</Button></form></> : <><Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-700">Sign in</Link><Link href="/onboarding" className="rounded-full bg-[#173b5b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102c45]">Start eligibility check</Link></>}
        </div>
        <button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="site-mobile-nav" onClick={() => setOpen((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-800 lg:hidden"><span className="sr-only">Menu</span>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      <nav id="site-mobile-nav" aria-label="Mobile navigation" hidden={!open} className="border-t border-slate-200 bg-white px-5 py-3 lg:hidden">
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={cn('block border-b border-slate-100 py-3 text-sm font-medium last:border-0', pathname === link.href || pathname.startsWith(`${link.href}/`) ? 'text-[#173b5b]' : 'text-slate-700')}>{link.label}</Link>)}
        <div className="flex gap-3 py-3 sm:hidden">{user ? <form action={signOut}><Button variant="outline" size="sm"><LogOut className="mr-1.5 h-4 w-4" />Sign out</Button></form> : <><Link href="/login" className="rounded-full border px-4 py-2 text-sm">Sign in</Link><Link href="/onboarding" className="rounded-full bg-[#173b5b] px-4 py-2 text-sm text-white">Start eligibility check</Link></>}</div>
      </nav>
    </header>
  );
}
