import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  glassInput as glassInputEnhanced,
  cn as cnEnhanced,
} from '@/lib/glassmorphism-enhanced';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  errorMessage?: string;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, errorMessage, label, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const hasError = error || !!errorMessage;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-11 w-full rounded-xl px-4 py-2 text-sm',
              'backdrop-blur-xl bg-white/[0.08] border border-white/[0.15]',
              'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-white/50 text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-2',
              'focus-visible:border-emerald-400/50 focus-visible:shadow-lg focus-visible:shadow-emerald-500/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-300',
              'hover:border-white/20 hover:bg-white/[0.12]',
              hasError && 'border-red-500/50 focus-visible:ring-red-500/20 focus-visible:border-red-500/50',
              success && 'border-emerald-500/50 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50',
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={errorMessage ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {success && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" strokeWidth={2} />
          )}
          {hasError && !success && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" strokeWidth={2} />
          )}
        </div>
        {errorMessage && (
          <p id={`${inputId}-error`} className="text-sm text-red-400 flex items-center gap-1.5" role="alert">
            <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
            {errorMessage}
          </p>
        )}
        {helperText && !errorMessage && (
          <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

