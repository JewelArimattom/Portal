'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileText,
  Languages,
  CheckCircle2,
  Bookmark,
  Send,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Eligibility Matches', href: '/matches', icon: CheckCircle2 },
    { label: 'Browse Programmes', href: '/programmes', icon: BookOpen },
    { label: 'Shortlist', href: '/shortlist', icon: Bookmark },
    { label: 'Applications', href: '/applications', icon: Send },
    { label: 'Profile Wizard', href: '/onboarding', icon: GraduationCap },
    { label: 'Subjects & Credits', href: '/onboarding?step=5', icon: FileText },
    { label: 'Language Tests', href: '/onboarding?step=6', icon: Languages },
    { label: 'Preferences', href: '/onboarding?step=2', icon: SlidersHorizontal },
  ];

  return (
    <aside className="sticky top-16 h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto overscroll-contain border-r bg-slate-50/70 p-4 [scrollbar-color:#9aabb8_transparent] [scrollbar-width:thin]">
      <div className="flex min-h-full flex-col justify-between gap-6">
        <div>
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Student Space
          </h2>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#e8eef2] text-[#142f4b]'
                      : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-[#173b5b]' : 'text-slate-500')} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#173b5b] font-semibold text-xs uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" />
            A useful starting point
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Compare your profile with published programme requirements. Universities make their own admission decisions.
          </p>
        </div>
      </div>

      <div className="border-t pt-4 text-xs text-slate-500">
        UniMatch Platform v1.0
      </div>
    </aside>
  );
}
