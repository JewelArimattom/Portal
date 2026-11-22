'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Bookmark, LayoutDashboard, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Matches', href: '/matches', icon: Bookmark },
  { label: 'Browse', href: '/programmes', icon: BookOpen },
  { label: 'Profile', href: '/onboarding', icon: UserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Quick navigation" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur lg:hidden">
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#287090]',
              active ? 'text-[#142f4b]' : 'text-slate-500 hover:text-slate-800',
            )}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
