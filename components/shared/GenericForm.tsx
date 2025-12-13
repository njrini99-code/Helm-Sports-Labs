'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  FORM_INPUT_GLASS,
  FORM_TEXTAREA_GLASS,
  FORM_LABEL_GLASS,
  BUTTON_PRIMARY_GLASS,
  LOADING_SPINNER_SMALL,
} from '@/lib/constants/styles';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'date';
  placeholder?: string;
  required?: boolean;
  rows?: number; // for textarea
  validation?: (value: string) => string | null; // returns error message or null
}

export interface GenericFormProps {
  /** API endpoint to submit to (e.g., '/api/bulk-actions') */
  endpoint: string;

  /** Form fields configuration */
  fields: FormField[];

  /** Form title (optional) */
  title?: string;

  /** Submit button text */
  submitText?: string;

  /** HTTP method (default: POST) */
  method?: 'POST' | 'PUT' | 'PATCH';

  /** Callback after successful submission */
  onSuccess?: (data: any) => void;

  /** Callback on error */
  onError?: (error: Error) => void;

  /** Initial form data (for edit forms) */
  initialData?: Record<string, any>;

  /** Additional className for form container */
  className?: string;

  /** Use glass styling (default: true) */
  glassStyle?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function GenericForm({
  endpoint,
  fields,
  title,
  submitText = 'Submit',
  method = 'POST',
  onSuccess,
  onError,
  initialData = {},
  className = '',
  glassStyle = true,
}: GenericFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((field) => {
      initial[field.name] = initialData[field.name] || '';
    });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ═══════════════════════════════════════════════════════════════════════
  // Validation
  // ═══════════════════════════════════════════════════════════════════════

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.name];

      // Required field validation
      if (field.required && !value?.toString().trim()) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      // Custom validation
      if (field.validation && value) {
        const error = field.validation(value.toString());
        if (error) {
          newErrors[field.name] = error;
        }
      }

      // Email validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Invalid email address';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════════════════

  function handleChange(name: string, value: any) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to submit form (${response.status})`);
      }

      const data = await response.json();

      // Reset form on success
      const resetData: Record<string, any> = {};
      fields.forEach((field) => {
        resetData[field.name] = '';
      });
      setFormData(resetData);

      toast.success('Submitted successfully!');
      onSuccess?.(data);
    } catch (error) {
      console.error('Form submission error:', error);
      const message = error instanceof Error ? error.message : 'Failed to submit form';
      toast.error(message);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Render Field
  // ═══════════════════════════════════════════════════════════════════════

  function renderField(field: FormField) {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const hasError = !!error;

    const baseInputClass = glassStyle ? FORM_INPUT_GLASS : '';
    const baseTextareaClass = glassStyle ? FORM_TEXTAREA_GLASS : '';
    const baseLabelClass = glassStyle ? FORM_LABEL_GLASS : 'block text-sm font-medium text-gray-700 mb-2';

    const errorClass = hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '';

    if (field.type === 'textarea') {
      return (
        <div key={field.name}>
          <label htmlFor={field.name} className={baseLabelClass}>
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={`${baseTextareaClass} ${errorClass}`}
            disabled={loading}
            required={field.required}
          />
          {hasError && (
            <p className="mt-1 text-sm text-red-400">{error}</p>
          )}
        </div>
      );
    }

    return (
      <div key={field.name}>
        <label htmlFor={field.name} className={baseLabelClass}>
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <input
          id={field.name}
          name={field.name}
          type={field.type}
          value={value}
          onChange={(e) => handleChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={`${baseInputClass} ${errorClass}`}
          disabled={loading}
          required={field.required}
        />
        {hasError && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <h2 className={glassStyle ? 'text-2xl font-bold text-white mb-6' : 'text-2xl font-bold text-gray-900 mb-6'}>
          {title}
        </h2>
      )}

      <div className="space-y-4">
        {fields.map((field) => renderField(field))}
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className={BUTTON_PRIMARY_GLASS}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className={LOADING_SPINNER_SMALL} />
              Submitting...
            </span>
          ) : (
            submitText
          )}
        </button>
      </div>
    </motion.form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Convenience Exports - Common Field Configurations
// ═══════════════════════════════════════════════════════════════════════════

export const COMMON_FIELDS = {
  NAME: {
    name: 'name',
    label: 'Name',
    type: 'text' as const,
    placeholder: 'Enter name',
    required: true,
  },
  DESCRIPTION: {
    name: 'description',
    label: 'Description',
    type: 'textarea' as const,
    placeholder: 'Enter description',
    rows: 4,
  },
  EMAIL: {
    name: 'email',
    label: 'Email',
    type: 'email' as const,
    placeholder: 'email@example.com',
    required: true,
  },
  DATE: {
    name: 'date',
    label: 'Date',
    type: 'date' as const,
    required: true,
  },
};
