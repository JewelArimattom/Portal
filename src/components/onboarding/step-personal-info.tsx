'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { personalInfoSchema, type PersonalInfoInput } from '@/lib/validations/onboarding';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StepPersonalInfoProps {
  initialData?: Partial<PersonalInfoInput>;
  onSave: (data: PersonalInfoInput) => void;
  isSaving?: boolean;
}

export function StepPersonalInfo({ initialData, onSave, isSaving }: StepPersonalInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoInput, undefined, z.output<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: initialData?.fullName ?? '',
      phone: initialData?.phone ?? '',
      dateOfBirth: initialData?.dateOfBirth ?? '',
      nationality: initialData?.nationality ?? 'Indian',
      currentCountry: initialData?.currentCountry ?? 'India',
      currentState: initialData?.currentState ?? '',
      currentCity: initialData?.currentCity ?? '',
      passportAvailable: initialData?.passportAvailable ?? '',
      preferredLanguage: initialData?.preferredLanguage ?? 'en',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name (as per official records)" htmlFor="fullName" error={errors.fullName?.message} required>
              <Input id="fullName" placeholder="Your full name" {...register('fullName')} />
            </FormField>

            <FormField label="Phone Number" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" placeholder="Include your country code" {...register('phone')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date of Birth" htmlFor="dateOfBirth" error={errors.dateOfBirth?.message}>
              <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
            </FormField>

            <FormField label="Nationality" htmlFor="nationality" error={errors.nationality?.message} required>
              <Input id="nationality" placeholder="Your nationality" {...register('nationality')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Current Country" htmlFor="currentCountry" error={errors.currentCountry?.message} required>
              <Input id="currentCountry" placeholder="Your current country" {...register('currentCountry')} />
            </FormField>

            <FormField label="Current State / Region" htmlFor="currentState" error={errors.currentState?.message}>
              <Input id="currentState" placeholder="State or region" {...register('currentState')} />
            </FormField>

            <FormField label="Current City" htmlFor="currentCity" error={errors.currentCity?.message}>
              <Input id="currentCity" placeholder="Your current city" {...register('currentCity')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            <FormField label="Passport Status" htmlFor="passportAvailable" description="Do not enter passport number. We only track readiness.">
              <select
                id="passportAvailable"
                {...register('passportAvailable')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select passport status</option>
                <option value="yes">Valid Passport Available</option>
                <option value="in_progress">Passport Application in Progress</option>
                <option value="no">No Passport Yet</option>
              </select>
            </FormField>

            <FormField label="Preferred Communication Language" htmlFor="preferredLanguage">
              <select
                id="preferredLanguage"
                {...register('preferredLanguage')}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="en">English</option>
                <option value="de">German (Deutsch)</option>
              </select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white">
          {isSaving ? 'Saving...' : 'Save & Continue to Study Preferences'}
        </Button>
      </div>
    </form>
  );
}
