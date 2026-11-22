import React from 'react';
import type { RequirementEvaluation } from '@/lib/eligibility/types';
import { StatusBadge } from './status-badge';
import { ExternalLink, Info } from 'lucide-react';

interface RequirementRowProps {
  evaluation: RequirementEvaluation;
  sourceUrl?: string;
  sourceTitle?: string;
}

export function RequirementRow({ evaluation, sourceUrl, sourceTitle }: RequirementRowProps) {
  const isCoverageNotice = evaluation.requirementType === 'requirements_data_coverage';
  const requirementType = isCoverageNotice ? 'Course requirements' : evaluation.requirementType.replace(/_/g, ' ');
  const requirementDescription = isCoverageNotice
    ? 'We’re still checking this course’s entry requirements'
    : evaluation.requirementDescription;
  const requiredValue = isCoverageNotice
    ? 'Some details have not been confirmed yet'
    : evaluation.requiredValue ?? 'N/A';
  const studentValue = isCoverageNotice
    ? 'This is about course information, not your profile'
    : evaluation.studentValue ?? 'Not provided';
  const explanation = isCoverageNotice
    ? 'We have not confirmed all entry requirements with the university yet, so this match is only an estimate.'
    : evaluation.explanation;

  return (
    <div className="rounded-xl border bg-white p-4 transition-colors hover:border-slate-300 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              {requirementType}
            </span>
            {isCoverageNotice ? null : evaluation.isMandatory ? (
              <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                Mandatory
              </span>
            ) : (
              <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                Optional
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-slate-900">
            {requirementDescription}
          </h4>
        </div>

        <StatusBadge status={evaluation.status} size="sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <div>
          <span className="text-slate-500 block font-medium">Official Requirement:</span>
          <span className="text-slate-800 font-semibold">{requiredValue}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">Your Academic Record:</span>
          <span className="text-slate-800 font-semibold">{studentValue}</span>
        </div>
      </div>

      <div className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5 pt-1">
        <Info className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
        <span>{explanation}</span>
      </div>

      {sourceUrl && (
        <div className="pt-2 border-t flex justify-end">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            <span>Source: {sourceTitle ?? 'Official University Regulations'}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
