'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { glassInput, glassTextarea } from '@/lib/glassmorphism';

// ═══════════════════════════════════════════════════════════════════════════
// GlassInput - Text input with glassmorphism styling
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text above the input */
  label?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Error message (replaces helper text when present) */
  error?: string;
  /** Icon to display on the left */
  icon?: ReactNode;
  /** Icon to display on the right */
  iconRight?: ReactNode;
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
}

const inputSizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
};

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      label,
      helperText,
      error,
      icon,
      iconRight,
      size = 'md',
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              glassInput,
              inputSizeClasses[size],
              icon && 'pl-10',
              iconRight && 'pr-10',
              hasError && 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20',
              disabled && 'opacity-50 cursor-not-allowed',
              fullWidth && 'w-full',
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
              {iconRight}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p className={cn(
            'text-xs',
            hasError ? 'text-red-400' : 'text-white/50'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

// ═══════════════════════════════════════════════════════════════════════════
// GlassTextarea - Textarea with glassmorphism styling
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text above the textarea */
  label?: string;
  /** Helper text below the textarea */
  helperText?: string;
  /** Error message (replaces helper text when present) */
  error?: string;
  /** Full width */
  fullWidth?: boolean;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      className,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={cn(
            glassTextarea,
            hasError && 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20',
            disabled && 'opacity-50 cursor-not-allowed',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {(helperText || error) && (
          <p className={cn(
            'text-xs',
            hasError ? 'text-red-400' : 'text-white/50'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

GlassTextarea.displayName = 'GlassTextarea';

// ═══════════════════════════════════════════════════════════════════════════
// GlassSelect - Select dropdown with glassmorphism styling
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface GlassSelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Options for the select */
  options: GlassSelectOption[];
  /** Label text above the select */
  label?: string;
  /** Placeholder option text */
  placeholder?: string;
  /** Helper text below the select */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Select size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Current value */
  value?: string;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  (
    {
      options,
      label,
      placeholder,
      helperText,
      error,
      size = 'md',
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'backdrop-blur-xl bg-white/5 border border-white/15 rounded-lg text-white',
            'focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none',
            'transition-all duration-300 appearance-none cursor-pointer',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]',
            inputSizeClasses[size],
            'pr-10',
            hasError && 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20',
            disabled && 'opacity-50 cursor-not-allowed',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-slate-900 text-white/50">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="bg-slate-900 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        {(helperText || error) && (
          <p className={cn(
            'text-xs',
            hasError ? 'text-red-400' : 'text-white/50'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';

// ═══════════════════════════════════════════════════════════════════════════
// GlassSearch - Search input with icon
// ═══════════════════════════════════════════════════════════════════════════

import { Search } from 'lucide-react';

export interface GlassSearchProps extends Omit<GlassInputProps, 'icon'> {
  /** Called when search is submitted (Enter key) */
  onSearch?: (value: string) => void;
}

export const GlassSearch = forwardRef<HTMLInputElement, GlassSearchProps>(
  ({ onSearch, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch((e.target as HTMLInputElement).value);
      }
      onKeyDown?.(e);
    };

    return (
      <GlassInput
        ref={ref}
        type="search"
        icon={<Search className="w-4 h-4" />}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);

GlassSearch.displayName = 'GlassSearch';

export default GlassInput;

