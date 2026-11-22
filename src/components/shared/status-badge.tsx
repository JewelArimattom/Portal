import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { EvalStatus, OverallEligibility } from '@/lib/eligibility/types';
import { CheckCircle2, XCircle, HelpCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: EvalStatus | OverallEligibility | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', className, showIcon = true }: StatusBadgeProps) {
  let badgeClass = 'bg-slate-100 text-slate-800 border-slate-200';
  let label = status;
  let Icon = HelpCircle;

  switch (status) {
    case 'PASSED':
      badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
      label = 'Passed';
      Icon = CheckCircle2;
      break;
    case 'ELIGIBLE':
      badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold';
      label = 'Eligible';
      Icon = CheckCircle2;
      break;
    case 'CONDITIONALLY_ELIGIBLE':
      badgeClass = 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      label = 'Conditionally Eligible';
      Icon = Clock;
      break;
    case 'CONDITIONAL':
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      label = 'Conditional';
      Icon = Clock;
      break;
    case 'FAILED':
      badgeClass = 'bg-rose-50 text-rose-800 border-rose-200 font-medium';
      label = 'Failed';
      Icon = XCircle;
      break;
    case 'NOT_ELIGIBLE':
      badgeClass = 'bg-rose-100 text-rose-900 border-rose-300 font-semibold';
      label = 'Not Eligible';
      Icon = XCircle;
      break;
    case 'NEEDS_VERIFICATION':
      badgeClass = 'bg-blue-50 text-blue-900 border-blue-300 font-semibold';
      label = 'Needs Verification';
      Icon = AlertTriangle;
      break;
    case 'NEEDS_REVIEW':
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      label = 'Needs Review';
      Icon = AlertTriangle;
      break;
    case 'UNKNOWN':
      badgeClass = 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
      label = 'Missing Data';
      Icon = HelpCircle;
      break;
    case 'NOT_APPLICABLE':
      badgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
      label = 'Not Applicable';
      Icon = HelpCircle;
      break;
    case 'NOT_EVALUATED':
      badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
      label = 'Not Evaluated';
      Icon = HelpCircle;
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shadow-2xs font-medium whitespace-nowrap',
        badgeClass,
        sizeClasses,
        className
      )}
    >
      {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      <span>{label}</span>
    </span>
  );
}
