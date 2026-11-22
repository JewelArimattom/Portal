// Document Readiness Evaluator
// Checks whether the student has uploaded the required documents.

import type {
  RequirementEvaluation,
  StudentProfile,
  ProgrammeRequirement,
} from './types';

/** Common required document types for university applications */
const DOCUMENT_TYPE_ALIASES: Record<string, string[]> = {
  transcript: ['transcript', 'academic_transcript', 'mark_sheet', 'marksheet'],
  degree_certificate: ['degree_certificate', 'degree', 'graduation_certificate'],
  language_certificate: ['language_certificate', 'ielts', 'toefl', 'language_proof'],
  cv: ['cv', 'resume', 'curriculum_vitae'],
  passport: ['passport', 'id_document', 'identity'],
  recommendation: ['recommendation', 'reference_letter', 'lor'],
  sop: ['sop', 'statement_of_purpose', 'motivation_letter', 'personal_statement'],
  photo: ['photo', 'passport_photo', 'photograph'],
};

function normalizeDocType(raw: string): string {
  return raw.toLowerCase().replace(/[\s\-]/g, '_').trim();
}

function documentMatchesType(studentDocType: string, requiredDocType: string): boolean {
  const sNorm = normalizeDocType(studentDocType);
  const rNorm = normalizeDocType(requiredDocType);

  if (sNorm === rNorm) return true;

  // Check aliases
  for (const [, aliases] of Object.entries(DOCUMENT_TYPE_ALIASES)) {
    if (aliases.includes(rNorm) && aliases.includes(sNorm)) return true;
  }

  // Partial match
  return sNorm.includes(rNorm) || rNorm.includes(sNorm);
}

export function evaluateDocuments(
  profile: StudentProfile,
  requirement: ProgrammeRequirement,
): RequirementEvaluation {
  const base: Omit<RequirementEvaluation, 'status' | 'studentValue' | 'explanation' | 'details'> = {
    requirementId: requirement.id,
    requirementType: requirement.requirementType,
    requirementDescription: requirement.requirementDescription ?? 'Document requirement',
    requiredValue: requirement.requiredValue,
    isMandatory: requirement.isMandatory,
  };

  const requiredDocType = requirement.requiredValue ?? '';

  if (!requiredDocType) {
    return {
      ...base,
      status: 'NOT_APPLICABLE',
      studentValue: null,
      explanation: 'No specific document type is required by this requirement.',
    };
  }

  // Find matching documents in student profile
  const matchingDocs = profile.documents.filter((doc) =>
    documentMatchesType(doc.documentType, requiredDocType),
  );

  if (matchingDocs.length === 0) {
    return {
      ...base,
      status: 'CONDITIONAL',
      studentValue: 'Not uploaded',
      explanation:
        `The required document "${requiredDocType}" has not been uploaded yet. ` +
        'Please upload this document to complete your application.',
    };
  }

  // Check verification status
  const verifiedDoc = matchingDocs.find(
    (d) => d.verificationStatus === 'verified' || d.verificationStatus === 'approved',
  );
  const pendingDoc = matchingDocs.find(
    (d) => d.verificationStatus === 'pending' || d.verificationStatus === 'uploaded',
  );
  const rejectedDoc = matchingDocs.find(
    (d) => d.verificationStatus === 'rejected',
  );

  if (verifiedDoc) {
    return {
      ...base,
      status: 'PASSED',
      studentValue: `${requiredDocType} (verified)`,
      explanation: `Your "${requiredDocType}" document has been uploaded and verified.`,
    };
  }

  if (rejectedDoc && !pendingDoc) {
    return {
      ...base,
      status: 'FAILED',
      studentValue: `${requiredDocType} (rejected)`,
      explanation:
        `Your "${requiredDocType}" document was rejected. Please re-upload a valid document.`,
    };
  }

  // Document uploaded but pending verification
  return {
    ...base,
    status: 'CONDITIONAL',
    studentValue: `${requiredDocType} (pending verification)`,
    explanation:
      `Your "${requiredDocType}" document has been uploaded and is pending verification.`,
  };
}
