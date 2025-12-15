import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { glassCard } from '@/lib/glassmorphism';

// Button variants are kept calm and consistent; legacy names map to modern intent variants.
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-helm-green-500 to-helm-green-600 text-white shadow-lg shadow-helm-green-500/30 hover:from-helm-green-600 hover:to-helm-green-700 hover:shadow-xl hover:shadow-helm-green-500/40',
        primary: 'bg-gradient-to-r from-helm-green-500 to-helm-green-600 text-white shadow-lg shadow-helm-green-500/30 hover:from-helm-green-600 hover:to-helm-green-700 hover:shadow-xl hover:shadow-helm-green-500/40',
        secondary: `${glassCard} text-foreground hover:scale-[1.02]`,
        outline: `${glassCard} text-foreground hover:scale-[1.02]`,
        ghost: 'text-foreground hover:bg-helm-cream-100 dark:hover:bg-helm-gray-800 hover:text-foreground',
        subtle: 'bg-helm-cream-100 dark:bg-helm-gray-800 text-foreground hover:bg-helm-cream-200 dark:hover:bg-helm-gray-700',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        danger: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        link: 'text-helm-green-700 dark:text-helm-green-400 underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-helm-green-500 to-helm-green-600 text-white shadow-sm hover:from-helm-green-600 hover:to-helm-green-700',
        success: 'bg-gradient-to-r from-helm-green-500 to-helm-green-600 text-white shadow-sm hover:from-helm-green-600 hover:to-helm-green-700',
        glassPrimary: 'backdrop-blur-xl bg-gradient-to-br from-helm-green-500/90 to-helm-green-600/90 border border-white/20 shadow-lg shadow-helm-green-500/30 text-white rounded-lg px-6 py-3 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-helm-green-500/40 transition-all duration-300',
        glassSecondary: `${glassCard} text-foreground hover:scale-[1.02]`,
        glassGhost: 'backdrop-blur-xl bg-transparent border border-white/10 text-foreground/90 rounded-lg px-6 py-3 hover:bg-helm-cream-100/10 dark:hover:bg-helm-gray-800/20 hover:border-white/20 transition-all duration-300',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 rounded-lg px-4 text-sm',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5e57ddaf-a4e9-4035-836d-3aff839f6b8f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'F',
        location: 'button.tsx:Button',
        message: 'Button component rendering',
        data: { variant, size, asChild, hasOnClick: !!props.onClick, className: className?.substring(0, 50) },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion agent log

    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={asChild ? undefined : ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
