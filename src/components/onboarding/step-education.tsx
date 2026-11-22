'use client';

import React, { useState } from 'react';
import { educationSchema, type EducationInput } from '@/lib/validations/onboarding';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface StepEducationProps {
  initialData?: EducationInput[];
  intendedDegree?: 'bachelor' | 'master' | '';
  onSave: (data: EducationInput[]) => void;
  isSaving?: boolean;
}

export function StepEducation({
  initialData = [],
  intendedDegree = 'master',
  onSave,
  isSaving,
}: StepEducationProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [educations, setEducations] = useState<EducationInput[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            qualificationType: intendedDegree === 'master' ? 'bachelor' : 'class_12',
            qualificationName: '',
            boardOrUniversity: '',
            institutionName: '',
            institutionCountry: '',
            institutionCity: '',
            institutionType: undefined,
            streamOrSpecialization: '',
            completionYear: null,
            durationYears: null,
            numberOfSemesters: null,
            fullTime: true,
            creditSystem: '',
            totalCredits: null,
            universityRecognition: '',
            thesisTitle: '',
            internshipDetails: '',
            mathematicsStudied: false,
            physicsStudied: false,
            chemistryStudied: false,
            entranceExamDetails: '',
          },
        ]
  );

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        qualificationType: 'class_12',
        qualificationName: '',
        institutionName: '',
        institutionCountry: '',
        institutionCity: '',
        institutionType: undefined,
        streamOrSpecialization: '',
        completionYear: null,
        durationYears: null,
        numberOfSemesters: null,
        fullTime: true,
        creditSystem: '',
        totalCredits: null,
        universityRecognition: '',
        thesisTitle: '',
        internshipDetails: '',
        mathematicsStudied: false,
        physicsStudied: false,
        chemistryStudied: false,
        entranceExamDetails: '',
      },
    ]);
  };

  const removeEducation = (index: number) => {
    if (educations.length === 1) return;
    setEducations(educations.filter((_, i) => i !== index));
  };

  const updateEducation = <Key extends keyof EducationInput,>(index: number, field: Key, value: EducationInput[Key]) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedEducation = educationSchema.array().min(1).safeParse(educations);
    const hasValidEducation = parsedEducation.success && educations.some((education) =>
      education.qualificationName?.trim() && education.boardOrUniversity?.trim()
    );
    if (!hasValidEducation) {
      setValidationError('Enter at least one qualification name and its awarding board or university so we can assess your academic background.');
      return;
    }
    setValidationError(null);
    onSave(educations);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {validationError && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{validationError}</p>}
      <div className="space-y-4">
        {educations.map((edu, idx) => (
          <Card key={idx} className="relative">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Qualification #{idx + 1}: {edu.qualificationName || 'Education Record'}
              </CardTitle>
              {educations.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(idx)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Qualification Type" required>
                  <select
                    value={edu.qualificationType}
                    onChange={(e) => updateEducation(idx, 'qualificationType', e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="bachelor">Bachelor&apos;s Degree</option>
                    <option value="class_12">Class 12 / Higher Secondary</option>
                    <option value="class_10">Class 10 / Secondary</option>
                    <option value="master">Master&apos;s Degree</option>
                    <option value="diploma">Polytechnic / Diploma</option>
                  </select>
                </FormField>

                <FormField label="Exact Degree / Qualification Name" required>
                  <Input
                    value={edu.qualificationName ?? ''}
                    onChange={(e) => updateEducation(idx, 'qualificationName', e.target.value)}
                    placeholder="e.g. Bachelor of Computer Applications"
                  />
                </FormField>

                <FormField label="Specialization / Stream">
                  <Input
                    value={edu.streamOrSpecialization ?? ''}
                    onChange={(e) => updateEducation(idx, 'streamOrSpecialization', e.target.value)}
                    placeholder="e.g. Computer Science / Science"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Board or University Name" required>
                  <Input
                    value={edu.boardOrUniversity ?? ''}
                    onChange={(e) => updateEducation(idx, 'boardOrUniversity', e.target.value)}
                    placeholder="e.g. Bangalore University / CBSE"
                  />
                </FormField>

                <FormField label="College / Institution Name">
                  <Input
                    value={edu.institutionName ?? ''}
                    onChange={(e) => updateEducation(idx, 'institutionName', e.target.value)}
                    placeholder="e.g. Christ College"
                  />
                </FormField>

                <FormField label="Institution Country">
                  <Input
                    value={edu.institutionCountry ?? ''}
                    onChange={(e) => updateEducation(idx, 'institutionCountry', e.target.value)}
                    placeholder="India"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField label="Completion Year">
                  <Input
                    type="number"
                    value={edu.completionYear ?? ''}
                    onChange={(e) => updateEducation(idx, 'completionYear', e.target.value ? Number(e.target.value) : null)}
                    placeholder="2024"
                  />
                </FormField>

                <FormField label="Duration (Years)">
                  <Input
                    type="number"
                    step="0.5"
                    value={edu.durationYears ?? ''}
                    onChange={(e) => updateEducation(idx, 'durationYears', e.target.value ? Number(e.target.value) : null)}
                    placeholder="3 or 4"
                  />
                </FormField>

                <FormField label="Total Semesters">
                  <Input
                    type="number"
                    value={edu.numberOfSemesters ?? ''}
                    onChange={(e) => updateEducation(idx, 'numberOfSemesters', e.target.value ? Number(e.target.value) : null)}
                    placeholder="6 or 8"
                  />
                </FormField>

                <FormField label="Credit System">
                  <select
                    value={edu.creditSystem ?? ''}
                    onChange={(e) => updateEducation(idx, 'creditSystem', e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select credit system</option>
                    <option value="indian_credits">Indian Credits (UGC / AICTE)</option>
                    <option value="ects">ECTS (European Credit Transfer)</option>
                    <option value="us_credits">US Credits</option>
                    <option value="other">Other System</option>
                  </select>
                </FormField>
              </div>

              {edu.qualificationType === 'bachelor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                  <FormField label="Thesis / Final Year Project Title">
                    <Input
                      value={edu.thesisTitle ?? ''}
                      onChange={(e) => updateEducation(idx, 'thesisTitle', e.target.value)}
                      placeholder="e.g. Distributed Cloud File System"
                    />
                  </FormField>

                  <FormField label="University Recognition Information">
                    <Input
                      value={edu.universityRecognition ?? ''}
                      onChange={(e) => updateEducation(idx, 'universityRecognition', e.target.value)}
                      placeholder="e.g. UGC Recognized, NAAC A+ Grade"
                    />
                  </FormField>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addEducation}
          className="w-full border-dashed flex items-center justify-center gap-2 py-4 text-slate-700 hover:text-blue-700 hover:border-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Another Educational Qualification
        </Button>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white">
          {isSaving ? 'Saving...' : 'Save & Continue to Academic Grades'}
        </Button>
      </div>
    </form>
  );
}
