import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  glassInput as glassInputEnhanced,
} from '@/lib/glassmorphism-enhanced';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-xl px-4 py-3 text-sm',
          'backdrop-blur-xl bg-white/[0.08] border border-white/[0.15]',
          'ring-offset-background placeholder:text-white/50 text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-2',
          'focus-visible:border-emerald-400/50 focus-visible:shadow-lg focus-visible:shadow-emerald-500/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-300 resize-none',
          'hover:border-white/20 hover:bg-white/[0.12]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

