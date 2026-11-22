// Eligibility Engine — Public API
// Re-exports all types, evaluators, and utilities.

export * from './types';
export * from './constants';
export { evaluateDegree } from './evaluateDegree';
export { evaluateSubjects } from './evaluateSubjects';
export { calculateCreditsForCategory, isCreditSystemConvertible } from './evaluateCredits';
export { evaluateGrade } from './evaluateGrade';
export { evaluateLanguage } from './evaluateLanguage';
export { evaluateDocuments } from './evaluateDocuments';
export { evaluateDeadline } from './evaluateDeadline';
export type { DeadlineInfo } from './evaluateDeadline';
export { evaluateProgramme } from './evaluateProgramme';
export type { EvaluationOptions } from './evaluateProgramme';
export { calculateCompatibility } from './calculateCompatibility';
export {
  explainEvaluationResult,
  explainRequirement,
  explainCompatibility,
  generateOneLiner,
} from './explainResults';
