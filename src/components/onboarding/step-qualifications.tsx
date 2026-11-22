'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/shared/form-field';
import { Plus, Trash2, Award } from 'lucide-react';
import type { AdditionalQualificationInput } from '@/lib/validations/onboarding';

interface StepQualificationsProps {
  initialData?: AdditionalQualificationInput[];
  onSave: (data: AdditionalQualificationInput[]) => void;
  isSaving?: boolean;
}

export function StepQualifications({ initialData = [], onSave, isSaving }: StepQualificationsProps) {
  const [quals, setQuals] = useState<AdditionalQualificationInput[]>(initialData);

  const addQual = () => {
    setQuals([
      ...quals,
      {
        qualificationType: 'project',
        title: '',
        organization: '',
        description: '',
        durationMonths: null,
      },
    ]);
  };

  const removeQual = (index: number) => {
    setQuals(quals.filter((_, i) => i !== index));
  };

  const updateQual = <Key extends keyof AdditionalQualificationInput,>(index: number, field: Key, value: AdditionalQualificationInput[Key]) => {
    const updated = [...quals];
    updated[index] = { ...updated[index], [field]: value };
    setQuals(updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {quals.map((qual, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-700" />
                <CardTitle className="text-base font-semibold text-slate-900">
                  Experience / Qualification #{idx + 1}
                </CardTitle>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQual(idx)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Type" required>
                  <select
                    value={qual.qualificationType}
                    onChange={(e) => updateQual(idx, 'qualificationType', e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="internship">Internship Experience</option>
                    <option value="work">Full-Time Work Experience</option>
                    <option value="research">Academic Research</option>
                    <option value="publication">Paper / Publication</option>
                    <option value="project">Major Technical Project</option>
                    <option value="technical_cert">Technical Certification</option>
                    <option value="professional_cert">Professional Certification</option>
                    <option value="award">Award / Academic Distinction</option>
                    <option value="volunteering">Volunteering / Extracurricular</option>
                  </select>
                </FormField>

                <FormField label="Title / Position" required>
                  <Input
                    value={qual.title}
                    onChange={(e) => updateQual(idx, 'title', e.target.value)}
                    placeholder="e.g. Machine Learning Researcher"
                  />
                </FormField>

                <FormField label="Company / University / Organization">
                  <Input
                    value={qual.organization ?? ''}
                    onChange={(e) => updateQual(idx, 'organization', e.target.value)}
                    placeholder="e.g. Siemens or IIT"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Duration (Months)">
                  <Input
                    type="number"
                    value={qual.durationMonths ?? ''}
                    onChange={(e) => updateQual(idx, 'durationMonths', e.target.value ? Number(e.target.value) : null)}
                    placeholder="6"
                  />
                </FormField>

                <FormField label="Reference URL / DOI (Optional)">
                  <Input
                    value={qual.url ?? ''}
                    onChange={(e) => updateQual(idx, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                </FormField>
              </div>

              <FormField label="Key Contributions / Description">
                <textarea
                  value={qual.description ?? ''}
                  onChange={(e) => updateQual(idx, 'description', e.target.value)}
                  placeholder="Summarize your role, tools used, and outcomes..."
                  rows={2}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
                />
              </FormField>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addQual}
          className="w-full border-dashed flex items-center justify-center gap-2 py-3 text-slate-700 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Another Experience or Qualification
        </Button>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          onClick={() => onSave(quals)}
          disabled={isSaving}
          className="bg-blue-700 hover:bg-blue-800 text-white"
        >
          {isSaving ? 'Saving...' : 'Save & Continue to Career Interests'}
        </Button>
      </div>
    </div>
  );
}
