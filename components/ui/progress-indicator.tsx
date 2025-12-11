'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  current?: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ProgressIndicator({
  steps,
  currentStep,
  className,
  orientation = 'horizontal',
}: ProgressIndicatorProps) {
  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
        className
      )}
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Step ${currentStep + 1} of ${steps.length}`}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep || step.completed;
        const isCurrent = index === currentStep || step.current;
        const isUpcoming = index > currentStep && !isCurrent;

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                'flex items-center',
                orientation === 'horizontal' ? 'flex-row' : 'flex-col'
              )}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted &&
                      'border-emerald-500 bg-emerald-500 text-white',
                    isCurrent &&
                      'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isUpcoming &&
                      'border-muted bg-background text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div
                  className={cn(
                    'mt-2 text-center',
                    orientation === 'horizontal' ? 'w-24' : 'w-full'
                  )}
                >
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-foreground',
                      !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1',
                  orientation === 'horizontal'
                    ? 'h-0.5 mx-4'
                    : 'w-0.5 my-4',
                  isCompleted ? 'bg-emerald-500' : 'bg-muted'
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
