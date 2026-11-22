import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs border text-slate-600 mb-4">
        <Icon className="h-7 w-7 text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 leading-relaxed">
        {description}
      </p>
      {(actionLabel && (onAction || actionHref)) && (
        <div className="mt-6">
          {actionHref ? (
            <a href={actionHref}>
              <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white">
                {actionLabel}
              </Button>
            </a>
          ) : (
            <Button size="sm" onClick={onAction} className="bg-blue-700 hover:bg-blue-800 text-white">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
