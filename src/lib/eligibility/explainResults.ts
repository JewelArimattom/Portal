// Human-Readable Explanation Generator
// Generates factual, deterministic explanations for each evaluation.
// Every explanation references specific student data — no guessing.

import type {
  ProgrammeEvaluationResult,
  RequirementEvaluation,
  CompatibilityBreakdown,
  OverallEligibility,
} from './types';

/**
 * Generate a comprehensive human-readable summary of the evaluation.
 */
export function explainEvaluationResult(result: ProgrammeEvaluationResult): string {
  const lines: string[] = [];

  lines.push(`## Eligibility Assessment: ${result.programmeName}`);
  lines.push(`**University:** ${result.universityName}`);
  lines.push(`**Overall Status:** ${formatOverallEligibility(result.overallEligibility)}`);
  lines.push(`**Compatibility Score:** ${result.compatibilityScore.totalScore}/100${result.compatibilityScore.isProvisional ? ' (provisional)' : ''}`);
  lines.push(`**Profile Completeness:** ${result.profileCompleteness}%`);
  lines.push('');

  // Requirement results
  lines.push('### Requirement Details');
  lines.push('');

  for (const req of result.requirementResults) {
    lines.push(explainRequirement(req));
    lines.push('');
  }

  // Compatibility breakdown
  lines.push('### Compatibility Breakdown');
  lines.push(explainCompatibility(result.compatibilityScore));

  // Missing information
  if (result.compatibilityScore.missingInformation.length > 0) {
    lines.push('');
    lines.push('### Missing Information');
    for (const item of result.compatibilityScore.missingInformation) {
      lines.push(`- ${item}`);
    }
  }

  lines.push('');
  lines.push(`*Evaluated at: ${result.evaluatedAt}*`);
  lines.push(`*Requirement version: ${result.requirementVersionUsed}*`);

  return lines.join('\n');
}

/**
 * Generate an explanation for a single requirement evaluation.
 */
export function explainRequirement(req: RequirementEvaluation): string {
  const icon = statusIcon(req.status);
  const mandatoryTag = req.isMandatory ? '(mandatory)' : '(optional)';

  return `${icon} **${req.requirementDescription}** ${mandatoryTag}\n   ${req.explanation}`;
}

/**
 * Explain the compatibility breakdown.
 */
export function explainCompatibility(score: CompatibilityBreakdown): string {
  const lines: string[] = [];

  lines.push(`- Degree Relevance: ${score.degreeRelevance}/20`);
  lines.push(`- Subject Match: ${score.subjectMatch}/30`);
  lines.push(`- Academic Performance: ${score.academicPerformance}/15`);
  lines.push(`- Language Match: ${score.languageMatch}/15`);
  lines.push(`- Other Requirements: ${score.otherRequirements}/10`);
  lines.push(`- Supporting Qualifications: ${score.supportingQualifications}/10`);
  lines.push(`- **Total: ${score.totalScore}/100**${score.isProvisional ? ' *(provisional — missing data)*' : ''}`);

  return lines.join('\n');
}

/**
 * Generate a concise one-line summary for a requirement.
 */
export function generateOneLiner(req: RequirementEvaluation): string {
  switch (req.status) {
    case 'PASSED':
      return `✅ ${req.requirementDescription}: Met`;
    case 'FAILED':
      return `❌ ${req.requirementDescription}: Not met`;
    case 'CONDITIONAL':
      return `⏳ ${req.requirementDescription}: Conditionally met`;
    case 'UNKNOWN':
      return `❓ ${req.requirementDescription}: Data missing`;
    case 'NEEDS_REVIEW':
      return `🔍 ${req.requirementDescription}: Needs verification`;
    case 'NOT_APPLICABLE':
      return `➖ ${req.requirementDescription}: Not applicable`;
    default:
      return `${req.requirementDescription}: ${req.status}`;
  }
}

function formatOverallEligibility(status: OverallEligibility): string {
  switch (status) {
    case 'ELIGIBLE':
      return '✅ Eligible';
    case 'CONDITIONALLY_ELIGIBLE':
      return '⏳ Conditionally Eligible';
    case 'NEEDS_VERIFICATION':
      return '🔍 Needs Verification';
    case 'NOT_ELIGIBLE':
      return '❌ Not Eligible';
    case 'NOT_EVALUATED':
      return '➖ Not Yet Evaluated';
    default:
      return status;
  }
}

function statusIcon(status: string): string {
  switch (status) {
    case 'PASSED': return '✅';
    case 'FAILED': return '❌';
    case 'CONDITIONAL': return '⏳';
    case 'UNKNOWN': return '❓';
    case 'NEEDS_REVIEW': return '🔍';
    case 'NOT_APPLICABLE': return '➖';
    default: return '•';
  }
}
