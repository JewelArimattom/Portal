'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  FileCheck2,
  History,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Universities', href: '/admin/universities', icon: Building2 },
    { label: 'Programmes', href: '/admin/programmes', icon: BookOpen },
    { label: 'Requirement Verification', href: '/admin/verification', icon: FileCheck2 },
    { label: 'Audit Logs', href: '/admin/audit', icon: History },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-[#f3f6f7] p-4 text-slate-700 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2 flex items-center gap-2 text-[#142f4b] font-semibold text-sm">
          <ShieldAlert className="h-5 w-5 text-[#173b5b]" />
          <span>Admin Portal</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#e2eaf0] text-[#142f4b]'
                    : 'text-slate-600 hover:bg-white hover:text-[#142f4b]'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-[#173b5b]' : 'text-slate-500')} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#173b5b] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Student Space
        </Link>
      </div>
    </aside>
  );
}
