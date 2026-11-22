'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseInterestsSchema, type CourseInterestsInput } from '@/lib/validations/onboarding';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StepInterestsProps {
  initialData?: Partial<CourseInterestsInput>;
  onSave: (data: CourseInterestsInput) => void;
  isSaving?: boolean;
}

export function StepInterests({ initialData, onSave, isSaving }: StepInterestsProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
  } = useForm<CourseInterestsInput>({
    resolver: zodResolver(courseInterestsSchema),
    defaultValues: {
      preferredStudyFields: initialData?.preferredStudyFields ?? [],
      preferredSpecializations: initialData?.preferredSpecializations ?? [],
      careerGoal: initialData?.careerGoal ?? '',
      researchOrIndustry: initialData?.researchOrIndustry ?? 'undecided',
      willingnessToChangeField: initialData?.willingnessToChangeField ?? false,
      preferredDuration: initialData?.preferredDuration ?? 'flexible',
      importanceTuition: initialData?.importanceTuition ?? 3,
      importanceCity: initialData?.importanceCity ?? 3,
      importanceReputation: initialData?.importanceReputation ?? 3,
      importanceEmployment: initialData?.importanceEmployment ?? 3,
    },
  });
  const preferredStudyFields = useWatch({ control, name: 'preferredStudyFields' });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <FormField label="Study fields you want to focus on" htmlFor="preferredStudyFields">
            <Input id="preferredStudyFields" placeholder="e.g. Computer Science, Data Science" value={(preferredStudyFields ?? []).join(', ')} onChange={(event) => {
              const fields = event.target.value.split(',').map((value) => value.trim());
              if (fields.length && fields[fields.length - 1] === '') fields.pop();
              setValue('preferredStudyFields', fields, { shouldValidate: true });
            }} />
          </FormField>

          <FormField label="Career Goal & Academic Vision">
            <textarea
              {...register('careerGoal')}
              rows={3}
              placeholder="e.g. Want to pursue a career in distributed systems and cloud infrastructure in Germany..."
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Focus Orientation">
              <select
                {...register('researchOrIndustry')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="industry">Industry Focused (Hands-on, internships, jobs)</option>
                <option value="research">Research / Academic (Preparation for PhD)</option>
                <option value="both">Balanced Both</option>
              </select>
            </FormField>

            <FormField label="Preferred Programme Duration">
              <select
                {...register('preferredDuration')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="4 semesters">2 Years (4 Semesters / 120 ECTS)</option>
                <option value="3 semesters">1.5 Years (3 Semesters / 90 ECTS)</option>
                <option value="flexible">Flexible</option>
              </select>
            </FormField>
          </div>

          <div className="pt-2 border-t space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">
              Factor Importance Ratings (1 = Low, 5 = Critical)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="Low Tuition (1-5)">
                <Input type="number" min="1" max="5" {...register('importanceTuition', { valueAsNumber: true })} />
              </FormField>

              <FormField label="City / Location (1-5)">
                <Input type="number" min="1" max="5" {...register('importanceCity', { valueAsNumber: true })} />
              </FormField>

              <FormField label="University Reputation (1-5)">
                <Input type="number" min="1" max="5" {...register('importanceReputation', { valueAsNumber: true })} />
              </FormField>

              <FormField label="Employment Post-Study (1-5)">
                <Input type="number" min="1" max="5" {...register('importanceEmployment', { valueAsNumber: true })} />
              </FormField>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white">
          {isSaving ? 'Saving...' : 'Save & Continue to Financial Details'}
        </Button>
      </div>
    </form>
  );
}
