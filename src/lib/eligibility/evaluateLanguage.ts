// Language Requirement Evaluator
// Evaluates language proficiency certificates against programme requirements.
// Supports English (IELTS, TOEFL, PTE, Cambridge, Duolingo) and
// German (Goethe, TestDaF, telc, ÖSD, DSH) tests.

import type {
  RequirementEvaluation,
  StudentProfile,
  StudentLanguageCertificate,
  ProgrammeRequirement,
} from './types';

/** Known English language tests */
const ENGLISH_TESTS = ['ielts', 'toefl', 'pte', 'cambridge', 'duolingo'];

/** Known German language tests */
const GERMAN_TESTS = ['goethe', 'testdaf', 'telc', 'ösd', 'oesd', 'dsh'];

/** Normalize test type for comparison */
function normalizeTestType(raw: string): string {
  return raw.toLowerCase().replace(/[\s\-_]/g, '').replace(/ö/g, 'oe');
}

/** Determine the language from a test type string */
function languageFromTest(testType: string): string {
  const norm = normalizeTestType(testType);
  if (ENGLISH_TESTS.some((t) => norm.includes(t))) return 'english';
  if (GERMAN_TESTS.some((t) => norm.includes(t))) return 'german';
  return 'unknown';
}

/** Check if a certificate has expired */
function isCertificateExpired(cert: StudentLanguageCertificate, referenceDate: Date): boolean {
  if (!cert.expiryDate) return false; // No expiry = assumed valid
  const expiry = new Date(cert.expiryDate);
  return expiry < referenceDate;
}

/** Check if the student's test matches the required test type */
function testTypeMatches(studentTestType: string, requiredTestType: string): boolean {
  const sNorm = normalizeTestType(studentTestType);
  const rNorm = normalizeTestType(requiredTestType);
  return sNorm.includes(rNorm) || rNorm.includes(sNorm);
}

export function evaluateLanguage(
  profile: StudentProfile,
  requirement: ProgrammeRequirement,
  referenceDate: Date = new Date(),
): RequirementEvaluation {
  const base: Omit<RequirementEvaluation, 'status' | 'studentValue' | 'explanation' | 'details'> = {
    requirementId: requirement.id,
    requirementType: requirement.requirementType,
    requirementDescription: requirement.requirementDescription ?? 'Language proficiency requirement',
    requiredValue: requirement.requiredValue ??
      (requirement.requiredValueNumeric !== null ? String(requirement.requiredValueNumeric) : null),
    isMandatory: requirement.isMandatory,
  };

  const requiredLanguage = detectRequiredLanguage(requirement);
  const requiredTestType = requirement.requiredValue?.split(/\s+/)[0] ?? '';
  const requiredScore = requirement.requiredValueNumeric;

  // Find matching certificates
  const matchingCerts = profile.languageCertificates.filter((cert) => {
    const certLang = cert.language.toLowerCase();
    const testLang = languageFromTest(cert.testType);
    return certLang === requiredLanguage || testLang === requiredLanguage;
  });

  // No certificates at all for this language
  if (matchingCerts.length === 0) {
    // Check if student has a planned test
    const plannedCert = profile.languageCertificates.find(
      (c: any) => c.plannedTestDate || (c.expectedScore !== null && c.expectedScore !== undefined),
    );
    if (plannedCert) {
      return {
        ...base,
        status: 'CONDITIONAL',
        studentValue: `Planned test: ${(plannedCert as any).plannedTestDate ?? 'Scheduled'}`,
        explanation: `Planned test date on ${(plannedCert as any).plannedTestDate ?? 'upcoming'}. This requirement is conditional on meeting the required score.`,
      };
    }

    // Check for medium of instruction waiver
    if (requiredLanguage === 'english') {
      const moiCert = profile.languageCertificates.find(
        (c) => c.moiCertificateAvailable || c.englishTaughtDegree,
      );
      if (moiCert) {
        // MOI waiver — only valid when programme explicitly allows it
        const descLower = (requirement.requirementDescription ?? '').toLowerCase();
        if (
          descLower.includes('medium of instruction') ||
          descLower.includes('moi') ||
          descLower.includes('waiver') ||
          descLower.includes('english-taught')
        ) {
          return {
            ...base,
            status: 'CONDITIONAL',
            studentValue: 'Medium of instruction certificate available',
            explanation:
              'You have a medium of instruction certificate indicating your degree was taught in English. ' +
              'This may qualify as a waiver for the English language requirement, subject to programme approval.',
            details: { waiverType: 'medium_of_instruction' },
          };
        }
      }
    }

    // If no language test information at all in the profile, treat as missing evidence (UNKNOWN)
    if (profile.languageCertificates.length === 0) {
      return {
        ...base,
        status: 'UNKNOWN',
        studentValue: null,
        explanation:
          `No ${requiredLanguage} language certificate found in your profile. ` +
          `Missing evidence — please enter your language test results or scheduled test date.`,
      };
    }

    return {
      ...base,
      status: 'FAILED',
      studentValue: null,
      explanation:
        `No valid ${requiredLanguage} language certificate found in your profile. ` +
        `The programme requires ${requirement.requiredValue ?? 'a language proficiency certificate'}.`,
    };
  }

  // Find the best matching certificate (prefer matching test type, then highest score)
  const sortedCerts = [...matchingCerts].sort((a, b) => {
    // Prefer exact test type match
    const aMatch = testTypeMatches(a.testType, requiredTestType) ? 1 : 0;
    const bMatch = testTypeMatches(b.testType, requiredTestType) ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;

    // Then by score
    return (b.overallScore ?? 0) - (a.overallScore ?? 0);
  });

  const bestCert = sortedCerts[0];

  // Check expiry
  if (isCertificateExpired(bestCert, referenceDate)) {
    return {
      ...base,
      status: 'FAILED',
      studentValue: `${bestCert.testType} ${bestCert.overallScore ?? ''} (expired: ${bestCert.expiryDate})`,
      explanation:
        `Your ${bestCert.testType} certificate with an overall score of ${bestCert.overallScore ?? 'N/A'} ` +
        `expired on ${bestCert.expiryDate}. You need a valid, non-expired certificate.`,
    };
  }

  // Check if this is a planned test
  if ((bestCert as any).plannedTestDate) {
    return {
      ...base,
      status: 'CONDITIONAL',
      studentValue: `Planned test: ${(bestCert as any).plannedTestDate}`,
      explanation: `Planned test date on ${(bestCert as any).plannedTestDate}. This requirement is conditional on taking the test and meeting the score.`,
    };
  }

  // Check certificate availability
  if (!bestCert.certificateAvailable) {
    return {
      ...base,
      status: 'CONDITIONAL',
      studentValue: `${bestCert.testType} ${bestCert.overallScore ?? ''} (certificate not yet available)`,
      explanation:
        `You have reported a ${bestCert.testType} score of ${bestCert.overallScore ?? 'N/A'}, ` +
        'but the certificate is not yet available. This requirement will be re-evaluated once the certificate is uploaded.',
    };
  }

  // Compare scores
  if (requiredScore !== null && requiredScore !== undefined && bestCert.overallScore !== null) {
    if (bestCert.overallScore >= requiredScore) {
      return {
        ...base,
        status: 'PASSED',
        studentValue: `${bestCert.testType} overall: ${bestCert.overallScore}`,
        explanation:
          `Your ${bestCert.testType} overall score of ${bestCert.overallScore} meets the minimum requirement of ${requiredScore}.`,
        details: formatCertDetails(bestCert),
      };
    }

    return {
      ...base,
      status: 'FAILED',
      studentValue: `${bestCert.testType} overall: ${bestCert.overallScore}`,
      explanation:
        `Your ${bestCert.testType} overall score of ${bestCert.overallScore} is below the minimum requirement of ${requiredScore}.`,
      details: formatCertDetails(bestCert),
    };
  }

  // No numeric comparison possible — test type match only
  if (!requiredScore && testTypeMatches(bestCert.testType, requiredTestType)) {
    return {
      ...base,
      status: 'PASSED',
      studentValue: `${bestCert.testType} ${bestCert.overallScore ?? bestCert.level ?? ''}`,
      explanation:
        `You have a valid ${bestCert.testType} certificate, which satisfies the language requirement.`,
      details: formatCertDetails(bestCert),
    };
  }

  return {
    ...base,
    status: 'NEEDS_REVIEW',
    studentValue: `${bestCert.testType} overall: ${bestCert.overallScore ?? 'N/A'}`,
    explanation:
      `You have a ${bestCert.testType} certificate with score ${bestCert.overallScore ?? 'N/A'}. ` +
      'The requirement could not be automatically verified. Manual review is needed.',
    details: formatCertDetails(bestCert),
  };
}

function detectRequiredLanguage(requirement: ProgrammeRequirement): string {
  const desc = (requirement.requirementDescription ?? '').toLowerCase();
  const val = (requirement.requiredValue ?? '').toLowerCase();
  const combined = `${desc} ${val}`;

  if (ENGLISH_TESTS.some((t) => combined.includes(t)) || combined.includes('english')) {
    return 'english';
  }
  if (GERMAN_TESTS.some((t) => combined.includes(t)) || combined.includes('german') || combined.includes('deutsch')) {
    return 'german';
  }
  return 'english'; // Default to English
}

function formatCertDetails(cert: StudentLanguageCertificate): Record<string, unknown> {
  return {
    testType: cert.testType,
    overallScore: cert.overallScore,
    readingScore: cert.readingScore,
    writingScore: cert.writingScore,
    listeningScore: cert.listeningScore,
    speakingScore: cert.speakingScore,
    testDate: cert.testDate,
    expiryDate: cert.expiryDate,
  };
}
