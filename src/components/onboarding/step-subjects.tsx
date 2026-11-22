'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { subjectSchema, type SubjectInput } from '@/lib/validations/onboarding';

interface StepSubjectsProps {
  initialData?: SubjectInput[];
  onSave: (data: SubjectInput[]) => void;
  isSaving?: boolean;
}

const TAXONOMY_CATEGORIES = [
  // CS
  'Programming', 'Data Structures', 'Algorithms', 'Operating Systems',
  'Database Management', 'Computer Networks', 'Software Engineering',
  'Computer Architecture', 'Theory of Computation', 'Compiler Design',
  'Cybersecurity', 'Web Development',
  // Math
  'Calculus', 'Linear Algebra', 'Discrete Mathematics', 'Statistics',
  'Probability', 'Numerical Methods', 'Differential Equations',
  'Optimization', 'Mathematical Foundations',
  // AI & Data Science
  'Artificial Intelligence', 'Machine Learning', 'Deep Learning',
  'Data Mining', 'Data Analytics', 'Big Data', 'Natural Language Processing',
  // Engineering
  'Electronics', 'Electrical Engineering', 'Physics', 'Digital Logic', 'Signals and Systems',
  // Business
  'Accounting', 'Economics', 'Finance', 'Business Management',
  'Operations Research', 'Business Analytics',
  // Other
  'General Education', 'Communication', 'Humanities', 'Unclassified',
];

function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, '');
  const firstLine = source.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = [';', '\t', ','].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell.trim()); cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[i + 1] === '\n') i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (quoted) throw new Error('A quoted value is not closed. Check the CSV formatting.');
  return rows;
}

function csvNumber(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

const normalizeCsvHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export function StepSubjects({ initialData = [], onSave, isSaving }: StepSubjectsProps) {
  const [subjects, setSubjects] = useState<SubjectInput[]>(initialData);

  const [activeSemester, setActiveSemester] = useState<number | 'all'>('all');
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSubjectRow = () => {
    const sem = activeSemester === 'all' ? 1 : activeSemester;
    setSubjects([
      ...subjects,
      {
        educationId: 'primary-education',
        semesterNumber: sem,
        subjectName: '',
        subjectCode: '',
        originalCredits: 0,
        creditSystem: '',
        theoryCredits: null,
        practicalCredits: null,
        subjectGrade: '',
        subjectMarks: null,
        categoryName: '',
      },
    ]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = <Key extends keyof SubjectInput,>(index: number, field: Key, value: SubjectInput[Key]) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError(null);
    setCsvSuccess(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const rows = parseCsv(await file.text());
      if (rows.length < 2) {
        setCsvError('This CSV has no subject rows. Add at least one subject and try again.');
        return;
      }
      const headers = rows[0].map(normalizeCsvHeader);
      const column = (names: string[], fallback: number) => {
        const found = headers.findIndex((header) => names.includes(header));
        return found < 0 ? fallback : found;
      };
      const columns = {
        semester: column(['semester', 'semesternumber', 'term'], 0),
        name: column(['subjectname', 'subject', 'coursename', 'modulename'], 1),
        code: column(['subjectcode', 'code', 'modulecode'], 2),
        credits: column(['credits', 'originalcredits', 'creditpoints', 'ects'], 3),
        creditSystem: column(['creditsystem'], 4),
        theory: column(['theorycredits', 'lecturecredits'], 5),
        practical: column(['practicalcredits', 'labcredits'], 6),
        grade: column(['grade', 'subjectgrade'], 7),
        marks: column(['marks', 'score', 'subjectmarks'], 8),
        category: column(['category', 'categoryname', 'subjectcategory'], 9),
      };
      const value = (row: string[], index: number) => row[index]?.trim() ?? '';
      const imported: SubjectInput[] = [];
      const invalidRows: number[] = [];

      rows.slice(1).forEach((row, index) => {
        const subjectName = value(row, columns.name);
        if (!subjectName) return;
        const semester = csvNumber(value(row, columns.semester));
        const credits = csvNumber(value(row, columns.credits));
        if (!semester || !Number.isInteger(semester) || semester < 1 || !credits || credits <= 0) {
          invalidRows.push(index + 2);
          return;
        }
        imported.push({
          educationId: subjects[0]?.educationId ?? 'primary-education',
          semesterNumber: semester,
          subjectName,
          subjectCode: value(row, columns.code) || '',
          originalCredits: credits,
          creditSystem: value(row, columns.creditSystem) || undefined,
          theoryCredits: csvNumber(value(row, columns.theory)),
          practicalCredits: csvNumber(value(row, columns.practical)),
          subjectGrade: value(row, columns.grade) || '',
          subjectMarks: csvNumber(value(row, columns.marks)),
          categoryName: value(row, columns.category) || 'Unclassified',
        });
      });

      if (!imported.length) {
        setCsvError(invalidRows.length
          ? `No subjects imported. Check semester and positive credits in row${invalidRows.length > 1 ? 's' : ''} ${invalidRows.join(', ')}.`
          : 'No subject names were found. Use the template or add a Subject Name column.');
        return;
      }
      setSubjects(imported);
      setCsvSuccess(`Imported ${imported.length} subject${imported.length === 1 ? '' : 's'} from ${file.name}.${invalidRows.length ? ` Skipped invalid row${invalidRows.length > 1 ? 's' : ''}: ${invalidRows.join(', ')}.` : ''}`);
    } catch (err: unknown) {
      setCsvError(`Could not read this CSV: ${err instanceof Error ? err.message : 'unknown parsing error'}`);
    }
  };

  const filteredSubjects = activeSemester === 'all'
    ? subjects
    : subjects.filter((s) => s.semesterNumber === activeSemester);

  // Compute category totals
  const categoryTotals: Record<string, number> = {};
  let totalCredits = 0;
  for (const sub of subjects) {
    const cat = sub.categoryName || 'Unclassified';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (sub.originalCredits || 0);
    totalCredits += sub.originalCredits || 0;
  }

  const semesters = Array.from(new Set(subjects.map((s) => s.semesterNumber))).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Semester-Wise Academic Subjects & Credits
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic matching checks your earned subject credits against university thresholds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/templates/subjects-template.csv"
              download="uni-match-subjects-template.csv"
              className="inline-flex"
            >
              <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Template CSV
              </Button>
            </a>

            <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
                Import CSV
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="sr-only"
                tabIndex={-1}
                aria-label="Choose subjects CSV file"
              />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {csvError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{csvError}</span>
            </div>
          )}

          {csvSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{csvSuccess}</span>
            </div>
          )}

          {/* Category Summary Bar */}
          <div className="rounded-xl bg-slate-50 border p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>Total Recorded Credits: <strong className="text-blue-700 text-sm">{totalCredits}</strong></span>
              <span>Total Subjects: <strong>{subjects.length}</strong></span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(categoryTotals).slice(0, 8).map(([cat, cr]) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs border shadow-2xs font-medium text-slate-700"
                >
                  <span className="text-slate-500">{cat}:</span>
                  <strong className="text-blue-700">{cr} cr</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Semester Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b">
            <button
              type="button"
              onClick={() => setActiveSemester('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeSemester === 'all' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Semesters ({subjects.length})
            </button>
            {semesters.map((sem) => (
              <button
                key={sem}
                type="button"
                onClick={() => setActiveSemester(sem)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeSemester === sem ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semester {sem} ({subjects.filter((s) => s.semesterNumber === sem).length})
              </button>
            ))}
          </div>

          {/* Subjects Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3 w-16">Sem</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Subject Name</th>
                  <th className="py-2.5 px-3 w-24">Code</th>
                  <th className="py-2.5 px-3 w-20">Credits</th>
                  <th className="py-2.5 px-3 w-20">Theory</th>
                  <th className="py-2.5 px-3 w-20">Practical</th>
                  <th className="py-2.5 px-3 w-20">Grade</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Subject Category</th>
                  <th className="py-2.5 px-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubjects.map((subject) => {
                  const globalIdx = subjects.indexOf(subject);
                  return (
                    <tr key={globalIdx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          value={subject.semesterNumber}
                          onChange={(e) => updateSubject(globalIdx, 'semesterNumber', Number(e.target.value))}
                          className="h-8 text-xs w-14"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={subject.subjectName}
                          onChange={(e) => updateSubject(globalIdx, 'subjectName', e.target.value)}
                          placeholder="e.g. Operating Systems"
                          className="h-8 text-xs font-medium"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={subject.subjectCode ?? ''}
                          onChange={(e) => updateSubject(globalIdx, 'subjectCode', e.target.value)}
                          placeholder="CS302"
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={subject.originalCredits}
                          onChange={(e) => updateSubject(globalIdx, 'originalCredits', Number(e.target.value))}
                          className="h-8 text-xs w-16 font-semibold"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={subject.theoryCredits ?? ''}
                          onChange={(e) => updateSubject(globalIdx, 'theoryCredits', e.target.value ? Number(e.target.value) : null)}
                          className="h-8 text-xs w-16"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={subject.practicalCredits ?? ''}
                          onChange={(e) => updateSubject(globalIdx, 'practicalCredits', e.target.value ? Number(e.target.value) : null)}
                          className="h-8 text-xs w-16"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={subject.subjectGrade ?? ''}
                          onChange={(e) => updateSubject(globalIdx, 'subjectGrade', e.target.value)}
                          placeholder="A"
                          className="h-8 text-xs w-14"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={subject.categoryName ?? 'Unclassified'}
                          onChange={(e) => updateSubject(globalIdx, 'categoryName', e.target.value)}
                          className="w-full h-8 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-900 shadow-2xs focus:ring-1 focus:ring-blue-600"
                        >
                          {TAXONOMY_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeSubject(globalIdx)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSubjectRow}
            className="w-full border-dashed flex items-center justify-center gap-2 py-3 text-slate-700 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Subject Row
          </Button>

          <div className="rounded-lg bg-amber-50/70 p-3 text-xs text-amber-900 border border-amber-200/80 leading-relaxed">
            <span className="font-semibold">Original Credits Guaranteed: </span>
            UniMatch does not automatically conflate Indian credits with European ECTS. Original credits and subject names are preserved exactly as on your transcript.
          </div>
        </CardContent>
      </Card>

      {validationError && <p className="text-sm text-amber-900" role="alert">{validationError}</p>}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          onClick={() => {
            const enteredSubjects = subjects.filter((subject) => subject.subjectName.trim());
            const parsed = subjectSchema.array().safeParse(enteredSubjects);
            if (!parsed.success) {
              setValidationError('Complete each subject row with its name, semester, and transcript credits, or remove the unfinished row.');
              return;
            }
            setValidationError(null);
            onSave(enteredSubjects);
          }}
          disabled={isSaving}
          className="bg-blue-700 hover:bg-blue-800 text-white"
        >
          {isSaving ? 'Saving...' : 'Save & Continue to Language Proficiency'}
        </Button>
      </div>
    </div>
  );
}
