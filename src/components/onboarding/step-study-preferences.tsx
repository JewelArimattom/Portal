'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { studyPreferencesSchema, type StudyPreferencesInput } from '@/lib/validations/onboarding';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StepStudyPreferencesProps {
  initialData?: Partial<StudyPreferencesInput>;
  onSave: (data: StudyPreferencesInput) => void;
  isSaving?: boolean;
}

export function StepStudyPreferences({ initialData, onSave, isSaving }: StepStudyPreferencesProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<StudyPreferencesInput, undefined, z.output<typeof studyPreferencesSchema>>({
    resolver: zodResolver(studyPreferencesSchema),
    defaultValues: {
      intendedDegree: initialData?.intendedDegree ?? '',
      preferredCountries: initialData?.preferredCountries ?? [],
      preferredAcademicYear: initialData?.preferredAcademicYear ?? '',
      preferredIntake: initialData?.preferredIntake ?? 'flexible',
      institutionTypePreference: initialData?.institutionTypePreference ?? 'both',
      programmeLanguage: initialData?.programmeLanguage ?? 'both',
      willingnessToLearnGerman: initialData?.willingnessToLearnGerman ?? false,
      currentGermanLevel: initialData?.currentGermanLevel ?? '',
      preferredSubjectAreas: initialData?.preferredSubjectAreas ?? [],
      preferredCities: initialData?.preferredCities ?? [],
      maxTuitionPerSemester: initialData?.maxTuitionPerSemester ?? null,
      annualLivingBudget: initialData?.annualLivingBudget ?? null,
      scholarshipRequired: initialData?.scholarshipRequired ?? false,
      willingnessToRelocate: initialData?.willingnessToRelocate ?? false,
      willingnessEntranceExam: initialData?.willingnessEntranceExam ?? false,
    },
  });
  const preferredSubjectAreas = useWatch({ control, name: 'preferredSubjectAreas' });
  const preferredCities = useWatch({ control, name: 'preferredCities' });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Intended Degree" htmlFor="intendedDegree" error={errors.intendedDegree?.message} required>
              <select
                id="intendedDegree"
                {...register('intendedDegree')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Choose degree level</option>
                <option value="master">Master&apos;s Degree (Postgraduate)</option>
                <option value="bachelor">Bachelor&apos;s Degree (Undergraduate)</option>
              </select>
            </FormField>

            <FormField label="Preferred Intake" htmlFor="preferredIntake">
              <select
                id="preferredIntake"
                {...register('preferredIntake')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="winter">Winter Semester (Starts Sept / Oct)</option>
                <option value="summer">Summer Semester (Starts March / April)</option>
                <option value="flexible">Flexible / Any</option>
              </select>
            </FormField>
          </div>

          <FormField label="Countries you want to study in" error={errors.preferredCountries?.message} required>
            <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-lg border border-slate-200 p-3">
              {['Germany', 'Austria'].map((country) => (
                <label key={country} className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-800">
                  <input type="checkbox" value={country} {...register('preferredCountries')} className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600" />
                  {country}
                </label>
              ))}
            </div>
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Teaching Language of Programme" htmlFor="programmeLanguage">
              <select
                id="programmeLanguage"
                {...register('programmeLanguage')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="english">100% English Taught</option>
                <option value="german">German Taught</option>
                <option value="both">Bilingual / Either</option>
              </select>
            </FormField>

            <FormField label="Current German Proficiency" htmlFor="currentGermanLevel">
              <select
                id="currentGermanLevel"
                {...register('currentGermanLevel')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select your level</option>
                <option value="none">No German (Beginner)</option>
                <option value="A1">A1 (Elementary)</option>
                <option value="A2">A2 (Basic)</option>
                <option value="B1">B1 (Intermediate)</option>
                <option value="B2">B2 (Upper Intermediate)</option>
                <option value="C1">C1 (Advanced)</option>
                <option value="C2">C2 (Mastery / Native)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Institution Type Preference" htmlFor="institutionTypePreference">
              <select
                id="institutionTypePreference"
                {...register('institutionTypePreference')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="public">Public Universities (Tuition-Free / Low Fees)</option>
                <option value="private">Private Universities</option>
                <option value="both">Both Public and Private</option>
              </select>
            </FormField>

            <FormField label="Max Tuition per Semester (€)" htmlFor="maxTuitionPerSemester">
              <Input
                id="maxTuitionPerSemester"
                type="number"
                placeholder="Leave blank if you have no limit"
                {...register('maxTuitionPerSemester', { setValueAs: (value) => value === '' ? null : Number(value) })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Subject areas of interest" htmlFor="preferredSubjectAreas">
              <Input id="preferredSubjectAreas" placeholder="e.g. Computer Science, Data Science" value={(preferredSubjectAreas ?? []).join(', ')} onChange={(event) => {
                const typed = event.target.value.split(',').map((value) => value.trim());
                if (typed.length && typed[typed.length - 1] === '') typed.pop();
                setValue('preferredSubjectAreas', typed, { shouldValidate: true });
              }} />
            </FormField>
            <FormField label="Preferred cities (optional)" htmlFor="preferredCities">
              <Input id="preferredCities" placeholder="e.g. Berlin, Munich" value={(preferredCities ?? []).join(', ')} onChange={(event) => {
                const typed = event.target.value.split(',').map((value) => value.trim());
                if (typed.length && typed[typed.length - 1] === '') typed.pop();
                setValue('preferredCities', typed, { shouldValidate: true });
              }} />
            </FormField>
          </div>

          <div className="pt-2 border-t">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
              <input type="checkbox" {...register('willingnessToLearnGerman')} className="rounded border-slate-300 text-blue-700" />
              <span>Willing to learn German prior to or during studies in Germany / Austria</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white">
          {isSaving ? 'Saving...' : 'Save & Continue to Educational Background'}
        </Button>
      </div>
    </form>
  );
}
