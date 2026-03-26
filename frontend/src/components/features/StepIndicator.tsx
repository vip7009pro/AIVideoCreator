import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  step: number;
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
}) => {
  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute left-6 top-16 h-[calc(100%-4rem)] w-0.5 bg-gray-200" />

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.step);
          const isCurrent = step.step === currentStep;
          const isActive = step.step <= currentStep;

          return (
            <div key={step.step} className="relative flex gap-4">
              {/* Step circle */}
              <div
                className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 font-semibold text-white transition-colors ${
                  isCompleted
                    ? 'border-green-500 bg-green-500'
                    : isCurrent
                    ? 'border-blue-500 bg-blue-500 animate-pulse'
                    : isActive
                    ? 'border-blue-300 bg-blue-300'
                    : 'border-gray-300 bg-gray-300'
                }`}
              >
                {isCompleted ? <Check size={20} /> : step.step}
              </div>

              {/* Step content */}
              <div className="flex-1 pt-2">
                <h3
                  className={`font-semibold ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-700'
                  }`}
                >
                  {step.label}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
