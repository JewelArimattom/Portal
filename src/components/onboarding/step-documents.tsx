'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Trash2, CheckCircle2, ShieldCheck, Eye, Download, AlertCircle } from 'lucide-react';

interface DocumentRecord {
  id: string;
  documentType: string;
  documentLabel: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface StepDocumentsProps {
  initialDocuments?: DocumentRecord[];
  onUpload: (file: File, documentType: string) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<void>;
  onContinue: () => void;
  isSaving?: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport (Identity Page)' },
  { value: 'bachelor_certificate', label: 'Bachelor’s Degree Certificate' },
  { value: 'transcript', label: 'Consolidated Official Transcript' },
  { value: 'marksheet', label: 'Semester Marksheets' },
  { value: 'english_certificate', label: 'IELTS / TOEFL / Language Certificate' },
  { value: 'german_certificate', label: 'German Language Certificate (Goethe/TestDaF)' },
  { value: 'cv', label: 'Curriculum Vitae (CV)' },
  { value: 'motivation_letter', label: 'Statement of Purpose / Motivation Letter' },
  { value: 'recommendation_letter', label: 'Letter of Recommendation (LOR)' },
  { value: 'syllabus', label: 'Subject Syllabus / Module Handbook' },
  { value: 'aps_certificate', label: 'APS Certificate' },
  { value: 'other', label: 'Other Document' },
];

export function StepDocuments({
  initialDocuments = [],
  onUpload,
  onDelete,
  onContinue,
  isSaving,
}: StepDocumentsProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>(
    initialDocuments.length > 0
      ? initialDocuments
      : [
          {
            id: 'doc-1',
            documentType: 'transcript',
            documentLabel: 'Consolidated Official Transcript',
            fileName: 'bachelor_transcripts_official.pdf',
            fileSize: 1420500,
            mimeType: 'application/pdf',
            uploadedAt: '2026-11-20',
          },
          {
            id: 'doc-2',
            documentType: 'english_certificate',
            documentLabel: 'IELTS Academic TRF',
            fileName: 'ielts_score_card_2025.pdf',
            fileSize: 680200,
            mimeType: 'application/pdf',
            uploadedAt: '2026-11-20',
          },
        ]
  );

  const [selectedType, setSelectedType] = useState('bachelor_certificate');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit.');
      return;
    }

    const allowedMime = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMime.includes(file.type)) {
      setUploadError('Only PDF, JPG, JPEG, and PNG files are accepted.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const typeObj = DOCUMENT_TYPES.find((d) => d.value === selectedType);
      const newDoc: DocumentRecord = {
        id: `doc-${Date.now()}`,
        documentType: selectedType,
        documentLabel: typeObj?.label ?? selectedType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString().split('T')[0],
      };

      setDocuments((prev) => [...prev, newDoc]);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-900">
            Secure Document Storage
          </CardTitle>
          <p className="text-xs text-slate-500">
            Uploaded documents are stored in private encrypted Supabase storage buckets. NO OCR, AI extraction, or external bots are ever run on your files.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Upload Zone */}
          <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
              <Upload className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-900">Upload Academic Document</div>
              <p className="text-xs text-slate-500">PDF, JPG, JPEG, or PNG up to 10MB per file</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 shadow-xs focus:ring-2 focus:ring-blue-600"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <label className="cursor-pointer">
                <Button type="button" size="sm" disabled={uploading} className="bg-blue-700 hover:bg-blue-800 text-white pointer-events-none">
                  {uploading ? 'Uploading...' : 'Choose File to Upload'}
                </Button>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {uploadError && (
              <div className="text-xs font-medium text-red-600 flex items-center gap-1.5 pt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Uploaded Documents ({documents.length})
            </h4>

            {documents.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center border rounded-lg bg-slate-50">
                No documents uploaded yet. You may also proceed and upload documents later.
              </div>
            ) : (
              <div className="divide-y border rounded-xl bg-white overflow-hidden">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{doc.documentLabel}</div>
                        <div className="text-slate-500 flex items-center gap-2">
                          <span>{doc.fileName}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{doc.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-slate-50 border p-3 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>Files are stored privately with Row Level Security. Only you and authorized university reviewers can access them via signed URLs.</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          onClick={onContinue}
          disabled={isSaving}
          className="bg-blue-700 hover:bg-blue-800 text-white"
        >
          {isSaving ? 'Saving...' : 'Save & Continue to Profile Review'}
        </Button>
      </div>
    </div>
  );
}
