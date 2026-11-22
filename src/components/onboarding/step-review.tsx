'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Edit3, ShieldAlert } from 'lucide-react';
import type {
  PersonalInfoInput,
  StudyPreferencesInput,
  EducationInput,
  AcademicResultsInput,
  SubjectInput,
  LanguageCertificateInput,
} from '@/lib/validations/onboarding';

interface StepReviewProps {
  personalInfo?: Partial<PersonalInfoInput>;
  preferences?: Partial<StudyPreferencesInput>;
  educations?: EducationInput[];
  academicResults?: Partial<AcademicResultsInput>;
  subjects?: SubjectInput[];
  languages?: LanguageCertificateInput[];
  onConfirmSubmit: () => void;
  onJumpToStep: (stepId: number) => void;
  isSubmitting?: boolean;
}

export function StepReview({
  personalInfo,
  preferences,
  educations = [],
  academicResults,
  subjects = [],
  languages = [],
  onConfirmSubmit,
  onJumpToStep,
  isSubmitting,
}: StepReviewProps) {
  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false);

  // Compute profile completeness
  let completeness = 0;
  if (personalInfo?.fullName) completeness += 15;
  if (preferences?.intendedDegree) completeness += 15;
  if (educations.length > 0) completeness += 20;
  if (academicResults?.actualScore) completeness += 15;
  if (subjects.length > 0) completeness += 20;
  if (languages.length > 0) completeness += 15;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Final Profile Review & Confirmation
            </CardTitle>
            <p className="text-xs text-slate-500">
              Review all entered academic background data before running deterministic matching.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">Completeness</span>
            <div className="text-lg font-bold text-blue-700">{completeness}%</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Section 1: Personal & Preferences */}
          <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-slate-900">Personal & Study Goals</h4>
              <Button type="button" variant="ghost" size="sm" onClick={() => onJumpToStep(1)} className="text-xs gap-1 text-blue-700">
                <Edit3 className="h-3 w-3" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Name:</span>
                <span className="font-semibold text-slate-800">{personalInfo?.fullName || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nationality:</span>
                <span className="font-semibold text-slate-800">{personalInfo?.nationality || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Degree:</span>
                <span className="font-semibold text-slate-800 capitalize">{preferences?.intendedDegree || 'Not selected'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Countries:</span>
                <span className="font-semibold text-slate-800">{preferences?.preferredCountries?.join(', ') || 'Not selected'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Education & Grades */}
          <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-slate-900">Education & Academic Record</h4>
              <Button type="button" variant="ghost" size="sm" onClick={() => onJumpToStep(3)} className="text-xs gap-1 text-blue-700">
                <Edit3 className="h-3 w-3" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Primary Qualification:</span>
                <span className="font-semibold text-slate-800">{educations[0]?.qualificationName || 'Not entered'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Grading Scale:</span>
                <span className="font-semibold text-slate-800 uppercase">{academicResults?.gradingSystem || 'CGPA'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Score / CGPA:</span>
                <span className="font-semibold text-blue-700">{academicResults?.actualScore ?? 'N/A'} / {academicResults?.maximumScore ?? 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Subject Breakdown */}
          <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-slate-900">Subject-Wise Credits ({subjects.length} Subjects)</h4>
              <Button type="button" variant="ghost" size="sm" onClick={() => onJumpToStep(5)} className="text-xs gap-1 text-blue-700">
                <Edit3 className="h-3 w-3" /> Edit
              </Button>
            </div>
            <p className="text-xs text-slate-600">
              Total Recorded Credits: <strong className="text-blue-700 font-bold">{subjects.reduce((sum, s) => sum + (s.originalCredits || 0), 0)}</strong>
            </p>
          </div>

          {/* Section 4: Languages */}
          <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-slate-900">Language Certificates</h4>
              <Button type="button" variant="ghost" size="sm" onClick={() => onJumpToStep(6)} className="text-xs gap-1 text-blue-700">
                <Edit3 className="h-3 w-3" /> Edit
              </Button>
            </div>
            <div className="space-y-1 text-xs">
              {languages.length === 0 ? (
                <div className="text-slate-500">No language certificates entered yet.</div>
              ) : (
                languages.map((l, i) => (
                  <div key={i} className="flex justify-between py-1 border-b last:border-b-0">
                    <span className="font-medium uppercase text-slate-700">{l.testType} ({l.language})</span>
                    <span className="font-bold text-blue-700">{l.overallScore ? `Score: ${l.overallScore}` : l.level ? `Level: ${l.level}` : 'Planned'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Disclaimer & Confirmation */}
          <div className="rounded-xl bg-slate-50 border p-4 space-y-3 text-xs leading-relaxed text-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldAlert className="h-4 w-4 text-blue-700" />
              <span>Platform Assessment Agreement</span>
            </div>
            <p>
              By confirming, you acknowledge that all evaluations produced by UniMatch are strictly deterministic rule calculations based on your self-reported academic data and published university requirements. UniMatch does not guarantee admission and is not an agent of any university.
            </p>
            <label className="flex items-start gap-2 pt-2 cursor-pointer text-slate-900 font-medium">
              <input
                type="checkbox"
                checked={confirmedAccuracy}
                onChange={(e) => setConfirmedAccuracy(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-700 h-4 w-4"
              />
              <span>I confirm that all entered educational qualifications, subjects, credits, and test scores accurately reflect my official records.</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" onClick={() => onJumpToStep(8)}>
          Back
        </Button>
        <Button
          type="button"
          disabled={!confirmedAccuracy || isSubmitting}
          onClick={onConfirmSubmit}
          className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
        >
          {isSubmitting ? 'Finalizing Profile...' : 'Submit Profile & Find My Programmes'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
