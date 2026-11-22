'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { academicResultsSchema, type AcademicResultsInput } from '@/lib/validations/onboarding';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StepAcademicResultsProps {
  initialData?: Partial<AcademicResultsInput>;
  onSave: (data: AcademicResultsInput) => void;
  isSaving?: boolean;
}

export function StepAcademicResults({ initialData, onSave, isSaving }: StepAcademicResultsProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AcademicResultsInput, undefined, z.output<typeof academicResultsSchema>>({
    resolver: zodResolver(academicResultsSchema),
    defaultValues: {
      educationId: initialData?.educationId ?? 'primary-education',
      gradingSystem: initialData?.gradingSystem ?? '',
      actualScore: initialData?.actualScore,
      maximumScore: initialData?.maximumScore,
      percentage: initialData?.percentage ?? null,
      classOrDivision: initialData?.classOrDivision ?? '',
      degreeStatus: initialData?.degreeStatus ?? '',
      failedSubjects: initialData?.failedSubjects ?? 0,
      repeatedSubjects: initialData?.repeatedSubjects ?? 0,
      backlogs: initialData?.backlogs ?? 0,
      academicGapsMonths: initialData?.academicGapsMonths ?? 0,
      awards: initialData?.awards ?? '',
      distinctions: initialData?.distinctions ?? '',
    },
  });

  const gradingSystem = useWatch({ control, name: 'gradingSystem' });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Grading System" htmlFor="gradingSystem" required>
              <select
                id="gradingSystem"
                {...register('gradingSystem')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select your grading system</option>
                <option value="cgpa">CGPA (e.g. 10-Point Scale)</option>
                <option value="percentage">Percentage (%)</option>
                <option value="gpa">GPA (4.0 Scale)</option>
                <option value="german">German Grade Scale (1.0 best, 4.0 pass)</option>
                <option value="other">Other System</option>
              </select>
            </FormField>

            <FormField label="Actual Score / Grade" htmlFor="actualScore" error={errors.actualScore?.message} required>
              <Input
                id="actualScore"
                type="number"
                step="0.01"
                placeholder={gradingSystem === 'percentage' ? '78.5' : '8.2'}
                {...register('actualScore', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Maximum Possible Score" htmlFor="maximumScore" error={errors.maximumScore?.message} required>
              <Input
                id="maximumScore"
                type="number"
                step="0.01"
                placeholder={gradingSystem === 'percentage' ? '100' : '10'}
                {...register('maximumScore', { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Equivalent Percentage (%)" htmlFor="percentage">
              <Input
                id="percentage"
                type="number"
                step="0.1"
                placeholder="77.9"
                {...register('percentage', { setValueAs: (value) => value === '' ? null : Number(value) })}
              />
            </FormField>

            <FormField label="Class / Division Awarded" htmlFor="classOrDivision">
              <Input
                id="classOrDivision"
                placeholder="First Class with Distinction"
                {...register('classOrDivision')}
              />
            </FormField>

            <FormField label="Degree Completion Status" htmlFor="degreeStatus">
              <select
                id="degreeStatus"
                {...register('degreeStatus')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select degree status</option>
                <option value="completed">Degree Completed (Degree Conferred)</option>
                <option value="in_progress">In Final Year / In Progress</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            <FormField label="Active Backlogs">
              <Input
                type="number"
                min="0"
                {...register('backlogs', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Failed Subjects (Past)">
              <Input
                type="number"
                min="0"
                {...register('failedSubjects', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Academic Gaps (Months)">
              <Input
                type="number"
                min="0"
                placeholder="0"
                {...register('academicGapsMonths', { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <div className="rounded-lg bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-200/60 leading-relaxed">
            <span className="font-semibold">Note on German Grade Equivalence: </span>
            The platform permanently preserves your original Indian CGPA and marks. German grade conversion (Modified Bavarian Formula) is only applied deterministically when university-specific passing and maximum benchmarks are strictly verified.
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white">
          {isSaving ? 'Saving...' : 'Save & Continue to Subject-Wise Credits'}
        </Button>
      </div>
    </form>
  );
}
