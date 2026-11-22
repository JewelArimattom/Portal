import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="mb-7 pb-5 pt-1">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-blue-700 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-medium">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans text-3xl font-semibold tracking-[-.025em] text-[#142f4b] sm:text-4xl">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1.5 text-sm text-slate-600 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}
