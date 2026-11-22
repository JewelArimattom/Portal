'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationReadinessSchema, type ApplicationReadinessInput } from '@/lib/validations/onboarding';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Square } from 'lucide-react';

interface StepReadinessProps {
  initialData?: Partial<ApplicationReadinessInput>;
  onSave: (data: ApplicationReadinessInput) => void;
  isSaving?: boolean;
}

export function StepReadiness({ initialData, onSave, isSaving }: StepReadinessProps) {
  const {
    register,
    handleSubmit,
    watch,
  } = useForm<ApplicationReadinessInput>({
    resolver: zodResolver(applicationReadinessSchema),
    defaultValues: {
      passportReady: initialData?.passportReady ?? true,
      transcriptsReady: initialData?.transcriptsReady ?? true,
      degreeCertReady: initialData?.degreeCertReady ?? true,
      languageCertReady: initialData?.languageCertReady ?? true,
      cvReady: initialData?.cvReady ?? true,
      motivationLetterReady: initialData?.motivationLetterReady ?? false,
      recommendationLettersReady: initialData?.recommendationLettersReady ?? false,
      syllabusReady: initialData?.syllabusReady ?? true,
      apsCertificateStatus: initialData?.apsCertificateStatus ?? 'applied',
      uniAssistAccount: initialData?.uniAssistAccount ?? 'yes',
      previousApplications: initialData?.previousApplications ?? 0,
    },
  });

  const checklistItems = [
    { name: 'passportReady', label: 'Valid Passport (valid for at least 12 months)' },
    { name: 'degreeCertReady', label: 'Bachelor’s Degree Certificate / Provisional Certificate' },
    { name: 'transcriptsReady', label: 'Official University Transcripts (Semester-wise or Consolidated)' },
    { name: 'languageCertReady', label: 'Language Proficiency Certificate (IELTS / TOEFL / German)' },
    { name: 'cvReady', label: 'Academic CV (Europass or German tabular format)' },
    { name: 'motivationLetterReady', label: 'Statement of Purpose / Motivation Letter drafted' },
    { name: 'recommendationLettersReady', label: 'Letters of Recommendation (LORs) from Professors' },
    { name: 'syllabusReady', label: 'Detailed Module Handbook / Course Syllabus' },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Document Readiness Checklist</h4>
            <p className="text-xs text-slate-500">
              Indicate which documents are ready so the eligibility engine can identify any missing requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {checklistItems.map((item) => (
              <label
                key={item.name}
                className="flex items-center gap-2.5 p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-800"
              >
                <input
                  type="checkbox"
                  {...register(item.name as any)}
                  className="rounded border-slate-300 text-blue-700 h-4 w-4"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <FormField
              label="APS Certificate Status (Mandatory for Indian students applying to Germany)"
              description="India-specific verification by German Academic Evaluation Centre"
            >
              <select
                {...register('apsCertificateStatus')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="received">APS Certificate Received</option>
                <option value="applied">APS Application Submitted / In Process</option>
                <option value="not_started">Not Started Yet</option>
                <option value="not_applicable">Not Applicable (e.g. Austrian universities only)</option>
              </select>
            </FormField>

            <FormField label="Uni-assist Account Created?">
              <select
                {...register('uniAssistAccount')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="yes">Yes, account is active</option>
                <option value="no">No, not yet</option>
                <option value="not_sure">Not sure what Uni-assist is</option>
              </select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white">
          {isSaving ? 'Saving...' : 'Save & Continue to Document Uploads'}
        </Button>
      </div>
    </form>
  );
}
