'use client';

import * as React from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveFormProps {
  children: React.ReactNode;
  onSave: (data: FormData) => Promise<void> | void;
  saveInterval?: number;
  storageKey?: string;
  className?: string;
}

export function AutoSaveForm({
  children,
  onSave,
  saveInterval = 30000, // 30 seconds
  storageKey,
  className,
}: AutoSaveFormProps) {
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const formRef = React.useRef<HTMLFormElement>(null);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleSave = React.useCallback(async () => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    setStatus('saving');

    try {
      await onSave(formData);
      setStatus('saved');
      
      if (storageKey) {
        const formValues: Record<string, string> = {};
        formData.forEach((value, key) => {
          formValues[key] = value.toString();
        });
        localStorage.setItem(storageKey, JSON.stringify(formValues));
      }

      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      console.error('Auto-save failed:', error);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [onSave, storageKey]);

  React.useEffect(() => {
    if (!formRef.current) return;

    const form = formRef.current;
    const handleInput = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(handleSave, saveInterval);
    };

    form.addEventListener('input', handleInput);
    form.addEventListener('change', handleInput);

    // Load saved data if available
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const formValues = JSON.parse(saved);
          Object.entries(formValues).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
            if (input) {
              input.value = value as string;
            });
        } catch (error) {
          console.error('Failed to load saved form data:', error);
        }
      }
    }

    return () => {
      form.removeEventListener('input', handleInput);
      form.removeEventListener('change', handleInput);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveInterval, handleSave, storageKey]);

  return (
    <form ref={formRef} className={cn('relative', className)}>
      {children}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-muted-foreground">
        {status === 'saving' && (
          <>
            <Save className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-emerald-500">Saved</span>
          </>
        )}
        {status === 'error' && (
          <>
            <span className="text-destructive">Save failed</span>
          </>
        )}
      </div>
    </form>
  );
}
