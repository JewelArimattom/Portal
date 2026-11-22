// Deadline Evaluator
// Checks whether application deadlines have passed.

import type {
  RequirementEvaluation,
  ProgrammeRequirement,
} from './types';

export interface DeadlineInfo {
  applicationDeadline: string | null;
  internationalDeadline: string | null;
  intakeStatus: string | null; // 'open', 'closed', 'upcoming'
  verificationDate: string | null;
}

/**
 * Evaluate whether the application deadline allows the student to apply.
 *
 * @param requirement    - The deadline requirement
 * @param deadlineInfo   - Deadline data for the programme intake
 * @param referenceDate  - Current date for comparison (injectable for testing)
 */
export function evaluateDeadline(
  requirement: ProgrammeRequirement,
  deadlineInfo: DeadlineInfo,
  referenceDate: Date = new Date(),
): RequirementEvaluation {
  const base: Omit<RequirementEvaluation, 'status' | 'studentValue' | 'explanation' | 'details'> = {
    requirementId: requirement.id,
    requirementType: requirement.requirementType,
    requirementDescription: requirement.requirementDescription ?? 'Application deadline',
    requiredValue: requirement.requiredValue,
    isMandatory: requirement.isMandatory,
  };

  // Intake explicitly closed
  if (deadlineInfo.intakeStatus === 'closed') {
    return {
      ...base,
      status: 'FAILED',
      studentValue: `Intake status: closed`,
      explanation: 'The programme intake is currently closed. Applications are not being accepted.',
    };
  }

  // Determine the relevant deadline
  const deadlineStr = deadlineInfo.internationalDeadline ?? deadlineInfo.applicationDeadline;

  if (!deadlineStr) {
    return {
      ...base,
      status: 'NEEDS_REVIEW',
      studentValue: null,
      explanation:
        'No application deadline information is available for this programme. ' +
        'Please check the university website for current deadlines.',
    };
  }

  const deadlineDate = new Date(deadlineStr);

  if (isNaN(deadlineDate.getTime())) {
    return {
      ...base,
      status: 'NEEDS_REVIEW',
      studentValue: deadlineStr,
      explanation:
        `The deadline "${deadlineStr}" could not be parsed. Manual verification is needed.`,
    };
  }

  // Check if verification data is stale (older than 90 days)
  if (deadlineInfo.verificationDate) {
    const verifiedAt = new Date(deadlineInfo.verificationDate);
    const daysSinceVerification = Math.floor(
      (referenceDate.getTime() - verifiedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceVerification > 90) {
      return {
        ...base,
        status: 'NEEDS_REVIEW',
        studentValue: formatDate(deadlineDate),
        explanation:
          `The application deadline is listed as ${formatDate(deadlineDate)}, but this information ` +
          `was last verified ${daysSinceVerification} days ago. Please confirm the deadline is still current.`,
        details: {
          deadline: deadlineStr,
          lastVerified: deadlineInfo.verificationDate,
          daysSinceVerification,
        },
      };
    }
  }

  // Compare dates
  if (referenceDate > deadlineDate) {
    return {
      ...base,
      status: 'FAILED',
      studentValue: formatDate(deadlineDate),
      explanation:
        `The application deadline (${formatDate(deadlineDate)}) has passed. You can no longer apply for this intake.`,
    };
  }

  const daysRemaining = Math.ceil(
    (deadlineDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    ...base,
    status: 'PASSED',
    studentValue: `${formatDate(deadlineDate)} (${daysRemaining} days remaining)`,
    explanation:
      `The application deadline (${formatDate(deadlineDate)}) has not yet passed. ` +
      `You have ${daysRemaining} days remaining to apply.`,
    details: {
      deadline: deadlineStr,
      daysRemaining,
    },
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
