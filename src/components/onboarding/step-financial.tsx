'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { financialInfoSchema, type FinancialInfoInput } from '@/lib/validations/onboarding';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StepFinancialProps {
  initialData?: Partial<FinancialInfoInput>;
  onSave: (data: FinancialInfoInput) => void;
  isSaving?: boolean;
}

export function StepFinancial({ initialData, onSave, isSaving }: StepFinancialProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FinancialInfoInput>({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: {
      maxTuitionPerSemester: initialData?.maxTuitionPerSemester ?? null,
      tuitionPreference: initialData?.tuitionPreference ?? 'free_or_under_500',
      annualLivingBudget: initialData?.annualLivingBudget ?? 11208,
      privateUniversityAffordable: initialData?.privateUniversityAffordable ?? false,
      applicationFeeBudget: initialData?.applicationFeeBudget ?? 300,
      scholarshipRequired: initialData?.scholarshipRequired ?? false,
      financialFlexibility: initialData?.financialFlexibility ?? 'Moderate',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Tuition Fee Preference">
              <select
                {...register('tuitionPreference')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="free_or_under_500">Tuition-Free or under €500 / semester (Public)</option>
                <option value="500_1000">€500 – €1,000 / semester</option>
                <option value="1000_2000">€1,000 – €2,000 / semester</option>
                <option value="2000_5000">€2,000 – €5,000 / semester</option>
                <option value="above_5000">Above €5,000 / semester (Private)</option>
              </select>
            </FormField>

            <FormField label="Annual Living Cost Budget (€)" description="Official German Blocked Account is ~€11,208 / year">
              <Input
                type="number"
                placeholder="11208"
                {...register('annualLivingBudget', { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Application Fee Budget (€)" description="Uni-assist charges €75 for first app + €30 per additional app">
              <Input
                type="number"
                placeholder="300"
                {...register('applicationFeeBudget', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Private University Affordability">
              <select
                {...register('privateUniversityAffordable')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="false">No — strictly interested in public universities</option>
                <option value="true">Yes — open to private universities if scholarship is available</option>
              </select>
            </FormField>
          </div>

          <div className="rounded-lg bg-slate-50 border p-3.5 text-xs text-slate-700 leading-relaxed space-y-1">
            <div className="font-semibold text-slate-900">Public Universities in Germany vs Austria:</div>
            <div>• <strong>Germany:</strong> Most public universities have no tuition fees for international students (only ~€150–€350 semester contribution). Exception: Baden-Württemberg charges €1,500/semester for non-EU students.</div>
            <div>• <strong>Austria:</strong> Public universities typically charge ~€726.72 per semester for non-EU students + ~€22.70 student union fee.</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white">
          {isSaving ? 'Saving...' : 'Save & Continue to Application Readiness'}
        </Button>
      </div>
    </form>
  );
}
