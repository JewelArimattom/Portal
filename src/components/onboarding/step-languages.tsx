'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/shared/form-field';
import { Plus, Trash2, Globe2 } from 'lucide-react';
import type { LanguageCertificateInput } from '@/lib/validations/onboarding';

interface StepLanguagesProps {
  initialData?: LanguageCertificateInput[];
  onSave: (data: LanguageCertificateInput[]) => void;
  isSaving?: boolean;
}

export function StepLanguages({ initialData = [], onSave, isSaving }: StepLanguagesProps) {
  const [certs, setCerts] = useState<LanguageCertificateInput[]>(initialData);

  const addEnglishCert = () => {
    setCerts([
      ...certs,
      {
        language: 'english',
        testType: 'ielts',
        overallScore: null,
        readingScore: null,
        writingScore: null,
        listeningScore: null,
        speakingScore: null,
        testDate: '',
        expiryDate: '',
        certificateAvailable: false,
        plannedTestDate: '',
        expectedScore: null,
        moiCertificateAvailable: false,
        englishTaughtDegree: false,
      },
    ]);
  };

  const addGermanCert = () => {
    setCerts([
      ...certs,
      {
        language: 'german',
        testType: 'goethe',
        level: null,
        overallScore: null,
        readingScore: null,
        writingScore: null,
        listeningScore: null,
        speakingScore: null,
        testDate: '',
        expiryDate: '',
        certificateAvailable: false,
        plannedTestDate: '',
        expectedScore: null,
        moiCertificateAvailable: false,
        englishTaughtDegree: false,
      },
    ]);
  };

  const removeCert = (index: number) => {
    setCerts(certs.filter((_, i) => i !== index));
  };

  const updateCert = <Key extends keyof LanguageCertificateInput,>(index: number, field: Key, value: LanguageCertificateInput[Key]) => {
    const updated = [...certs];
    updated[index] = { ...updated[index], [field]: value };
    setCerts(updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {certs.map((cert, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-blue-700" />
                <CardTitle className="text-base font-semibold text-slate-900">
                  {cert.language === 'english' ? 'English Proficiency' : 'German Language'} Certificate #{idx + 1}
                </CardTitle>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCert(idx)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Language" required>
                  <select
                    value={cert.language}
                    onChange={(e) => updateCert(idx, 'language', e.target.value as 'english' | 'german')}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="english">English</option>
                    <option value="german">German (Deutsch)</option>
                  </select>
                </FormField>

                <FormField label="Standardized Test Type" required>
                  {cert.language === 'english' ? (
                    <select
                      value={cert.testType}
                      onChange={(e) => updateCert(idx, 'testType', e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="ielts">IELTS Academic</option>
                      <option value="toefl">TOEFL iBT</option>
                      <option value="pte">PTE Academic</option>
                      <option value="cambridge">Cambridge C1 / C2</option>
                      <option value="duolingo">Duolingo English Test</option>
                      <option value="other">Other English Test</option>
                    </select>
                  ) : (
                    <select
                      value={cert.testType}
                      onChange={(e) => updateCert(idx, 'testType', e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="goethe">Goethe-Zertifikat</option>
                      <option value="testdaf">TestDaF</option>
                      <option value="telc">telc Deutsch</option>
                      <option value="osd">ÖSD (Österreichisches Sprachdiplom)</option>
                      <option value="dsh">DSH</option>
                      <option value="other">Other German Test</option>
                    </select>
                  )}
                </FormField>

                {cert.language === 'german' ? (
                  <FormField label="CEFR Level Achieved">
                    <select
                      value={cert.level ?? ''}
                      onChange={(e) => updateCert(idx, 'level', e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Select your level</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                    </select>
                  </FormField>
                ) : (
                  <FormField label="Overall Band / Score">
                    <Input
                      type="number"
                      step="0.5"
                      value={cert.overallScore ?? ''}
                      onChange={(e) => updateCert(idx, 'overallScore', e.target.value ? Number(e.target.value) : null)}
                      placeholder="e.g. 7.0 or 100"
                    />
                  </FormField>
                )}
              </div>

              {cert.language === 'english' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border">
                  <FormField label="Reading">
                    <Input
                      type="number"
                      step="0.5"
                      value={cert.readingScore ?? ''}
                      onChange={(e) => updateCert(idx, 'readingScore', e.target.value ? Number(e.target.value) : null)}
                      placeholder="7.0"
                      className="h-8 text-xs bg-white text-slate-900"
                    />
                  </FormField>
                  <FormField label="Writing">
                    <Input
                      type="number"
                      step="0.5"
                      value={cert.writingScore ?? ''}
                      onChange={(e) => updateCert(idx, 'writingScore', e.target.value ? Number(e.target.value) : null)}
                      placeholder="6.5"
                      className="h-8 text-xs bg-white text-slate-900"
                    />
                  </FormField>
                  <FormField label="Listening">
                    <Input
                      type="number"
                      step="0.5"
                      value={cert.listeningScore ?? ''}
                      onChange={(e) => updateCert(idx, 'listeningScore', e.target.value ? Number(e.target.value) : null)}
                      placeholder="7.5"
                      className="h-8 text-xs bg-white text-slate-900"
                    />
                  </FormField>
                  <FormField label="Speaking">
                    <Input
                      type="number"
                      step="0.5"
                      value={cert.speakingScore ?? ''}
                      onChange={(e) => updateCert(idx, 'speakingScore', e.target.value ? Number(e.target.value) : null)}
                      placeholder="7.0"
                      className="h-8 text-xs bg-white text-slate-900"
                    />
                  </FormField>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                <FormField label="Test Date Taken">
                  <Input
                    type="date"
                    value={cert.testDate ?? ''}
                    onChange={(e) => updateCert(idx, 'testDate', e.target.value)}
                  />
                </FormField>

                <FormField label="Certificate Expiry Date">
                  <Input
                    type="date"
                    value={cert.expiryDate ?? ''}
                    onChange={(e) => updateCert(idx, 'expiryDate', e.target.value)}
                  />
                </FormField>

                <FormField label="Certificate Availability">
                  <select
                    value={cert.certificateAvailable ? 'yes' : 'no'}
                    onChange={(e) => updateCert(idx, 'certificateAvailable', e.target.value === 'yes')}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="yes">Certificate in Hand</option>
                    <option value="no">Planned / Result Awaited</option>
                  </select>
                </FormField>
              </div>

              {!cert.certificateAvailable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                  <FormField label="Planned Test Date">
                    <Input
                      type="date"
                      value={cert.plannedTestDate ?? ''}
                      onChange={(e) => updateCert(idx, 'plannedTestDate', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Expected Target Score">
                    <Input
                      type="number"
                      step="0.5"
                      value={cert.expectedScore ?? ''}
                      onChange={(e) => updateCert(idx, 'expectedScore', e.target.value ? Number(e.target.value) : null)}
                      placeholder="e.g. 7.0"
                    />
                  </FormField>
                </div>
              )}

              {cert.language === 'english' && (
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cert.moiCertificateAvailable}
                      onChange={(e) => updateCert(idx, 'moiCertificateAvailable', e.target.checked)}
                      className="rounded border-slate-300 text-blue-700"
                    />
                    <span>Medium of Instruction (MOI) English Certificate available</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cert.englishTaughtDegree}
                      onChange={(e) => updateCert(idx, 'englishTaughtDegree', e.target.checked)}
                      className="rounded border-slate-300 text-blue-700"
                    />
                    <span>Previous degree was 100% taught in English</span>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" size="sm" onClick={addEnglishCert} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add English Test
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addGermanCert} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add German Test
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          onClick={() => onSave(certs)}
          disabled={isSaving}
          className="bg-blue-700 hover:bg-blue-800 text-white"
        >
          {isSaving ? 'Saving...' : 'Save & Continue to Qualifications'}
        </Button>
      </div>
    </div>
  );
}
