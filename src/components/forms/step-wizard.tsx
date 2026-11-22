'use client';

import React from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './step-wizard.module.css';

export interface WizardStep {
  id: number;
  title: string;
  shortTitle: string;
}

export const ONBOARDING_STEPS: WizardStep[] = [
  { id: 1, title: 'Personal Information', shortTitle: 'Personal' },
  { id: 2, title: 'Study Preferences', shortTitle: 'Preferences' },
  { id: 3, title: 'Educational Background', shortTitle: 'Education' },
  { id: 4, title: 'Academic Performance', shortTitle: 'Grades' },
  { id: 5, title: 'Subjects & Credits', shortTitle: 'Subjects' },
  { id: 6, title: 'Language Proficiency', shortTitle: 'Languages' },
  { id: 7, title: 'Additional Qualifications', shortTitle: 'Qualifications' },
  { id: 8, title: 'Career Interests', shortTitle: 'Interests' },
  { id: 9, title: 'Review & Confirm', shortTitle: 'Review' },
];

interface StepWizardProps {
  currentStep: number;
  completedSteps?: number[];
  onStepSelect: (stepId: number) => void;
  onPrev: () => void;
}

export function StepWizard({
  currentStep,
  completedSteps = [],
  onStepSelect,
  onPrev,
}: StepWizardProps) {
  const currentStepObj = ONBOARDING_STEPS.find((s) => s.id === currentStep) ?? ONBOARDING_STEPS[0];
  const progressPercent = Math.round((currentStep / ONBOARDING_STEPS.length) * 100);

  return (
    <div className={styles.wizard}>
      {/* Top Header / Progress */}
      <div className={styles.panel}>
        <div className={styles.topline}>
          <div>
            <span className={styles.stepCount}>
              Step {currentStep} of {ONBOARDING_STEPS.length}
            </span>
            <h2 className={styles.stepTitle}>{currentStepObj.title}</h2>
          </div>
          <div className={styles.progressLabel}>
            <span>Profile progress</span>
            <strong>{progressPercent}%</strong>
          </div>
        </div>

        {currentStep > 1 && (
          <button type="button" className={styles.backButton} onClick={onPrev}>
            <ChevronLeft aria-hidden="true" /> Back to previous step
          </button>
        )}

        {/* Progress bar */}
        <div className={styles.progressTrack} role="progressbar" aria-label="Onboarding progress" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <nav aria-label="Profile steps" className={styles.stepNav}>
          {ONBOARDING_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${step.id}: ${step.title}${isCompleted ? ', completed' : ''}`}
                onClick={() => onStepSelect(step.id)}
                className={cn(styles.stepButton, isCurrent && styles.currentStep, isCompleted && !isCurrent && styles.completedStep)}
              >
                {isCompleted && !isCurrent ? (
                    <Check className="h-3.5 w-3.5 text-[#285c41]" />
                ) : (
                  <span className="text-[11px] font-semibold">{step.id}</span>
                )}
                <span>{step.shortTitle}</span>
              </button>
            );
          })}
        </nav>

        <label className={styles.mobileStepPicker}>
          <span>Go to a step</span>
          <select value={currentStep} onChange={(event) => onStepSelect(Number(event.target.value))}>
            {ONBOARDING_STEPS.map((step) => (
              <option key={step.id} value={step.id}>{step.id}. {step.title}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
