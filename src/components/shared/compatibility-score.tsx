import React from 'react';
import type { CompatibilityBreakdown } from '@/lib/eligibility/types';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompatibilityScoreProps {
  score: CompatibilityBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
  className?: string;
}

const simpleMissingInformation: Record<string, string> = {
  'No grade requirements to evaluate against': 'We don’t have this course’s grade requirements yet, so we can’t compare your grades.',
  'Some additional requirements could not be verified': 'Some course entry requirements still need to be checked with the university.',
  'No supporting qualifications provided': 'No extra experience or projects added. These are optional, but may improve your match.',
};

export function CompatibilityScore({
  score,
  size = 'md',
  showBreakdown = false,
  className,
}: CompatibilityScoreProps) {
  const getScoreColor = (value: number) => {
    if (value >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (value >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex flex-col items-center justify-center font-bold rounded-xl border',
            getScoreColor(score.totalScore),
            size === 'sm' ? 'h-10 w-12 text-sm' : size === 'lg' ? 'h-20 w-24 text-2xl' : 'h-14 w-16 text-lg'
          )}
        >
          <span>{Math.round(score.totalScore)}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500">/ 100</span>
        </div>

        <div>
          <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
            Profile Compatibility Score
            {score.isProvisional && (
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                Provisional
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Rule-based match index (Not admission probability)
          </p>
        </div>
      </div>

      {score.isProvisional && score.missingInformation.length > 0 && (
        <div className="rounded-lg bg-amber-50/70 p-2.5 border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <span className="font-semibold">A few details are still missing: </span>
            {score.missingInformation.map((message) => simpleMissingInformation[message] ?? message).join(' ')}
          </div>
        </div>
      )}

      {showBreakdown && (
        <div className="space-y-2 pt-2 border-t text-xs">
          <div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Degree Relevance</span>
              <span className="font-medium text-slate-900">{score.degreeRelevance} / 20</span>
            </div>
            <Progress value={(score.degreeRelevance / 20) * 100} className="h-1.5" />
          </div>

          <div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Subject & Credit Match</span>
              <span className="font-medium text-slate-900">{score.subjectMatch} / 30</span>
            </div>
            <Progress value={(score.subjectMatch / 30) * 100} className="h-1.5" />
          </div>

          <div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Academic Performance (Grades)</span>
              <span className="font-medium text-slate-900">{score.academicPerformance} / 15</span>
            </div>
            <Progress value={(score.academicPerformance / 15) * 100} className="h-1.5" />
          </div>

          <div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Language Match</span>
              <span className="font-medium text-slate-900">{score.languageMatch} / 15</span>
            </div>
            <Progress value={(score.languageMatch / 15) * 100} className="h-1.5" />
          </div>

          <div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Other Academic Requirements</span>
              <span className="font-medium text-slate-900">{score.otherRequirements} / 10</span>
            </div>
            <Progress value={(score.otherRequirements / 10) * 100} className="h-1.5" />
          </div>

          <div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Supporting Qualifications</span>
              <span className="font-medium text-slate-900">{score.supportingQualifications} / 10</span>
            </div>
            <Progress value={(score.supportingQualifications / 10) * 100} className="h-1.5" />
          </div>
        </div>
      )}
    </div>
  );
}
