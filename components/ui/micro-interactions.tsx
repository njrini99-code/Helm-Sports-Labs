'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Success animation
interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({
  show,
  message,
  onComplete,
}: SuccessAnimationProps) {
  React.useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={ scale: 0, opacity: 0 }
      animate={ scale: 1, opacity: 1 }
      exit={ scale: 0, opacity: 0 }
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={ scale: 0 }
        animate={ scale: 1 }
        transition={{type: 'spring', stiffness: 200, damping: 15 }}
        className="bg-background rounded-2xl p-8 shadow-2xl text-center"
      >
        <motion.div
          initial={ scale: 0 }
          animate={ scale: 1 }
          transition={{delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
        </motion.div>
        {message && (
          <motion.p
            initial={ opacity: 0, y: 10 }
            animate={ opacity: 1, y: 0 }
            transition={{delay: 0.2 }}
            className="mt-4 text-lg font-medium"
          >
            {message}
          </motion.p>
)}
      </motion.div>
    </motion.div>
  );
}

// Error shake animation
interface ErrorShakeProps {
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}

export function ErrorShake({ children, trigger, className }: ErrorShakeProps) {
  return (
    <motion.div
      animate={trigger ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{duration: 0.5 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

// Loading button with spinner
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function LoadingButton({
  loading,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn('relative', className)}
    >
      <span className={cn(loading && 'opacity-0')}>{children}</span>
      {loading && (
        <motion.div
          initial={ opacity: 0 }
          animate={ opacity: 1 }
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            animate={ rotate: 360 }
            transition={{duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-5 w-5 border-2 border-current border-t-transparent rounded-full"
          />
        </motion.div>
)}
    </button>
  );
}

// Ripple effect
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function RippleButton({ children, onClick, className, ...props }: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={cn('relative overflow-hidden', className)}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          initial={ width: 0, height: 0, x: ripple.x, y: ripple.y }
          animate={ width: 200, height: 200, x: ripple.x - 100, y: ripple.y - 100, opacity: 0 }
          transition={{duration: 0.6 }}
        />
      })
    </button>
  );
}

// Hover lift effect
interface HoverLiftProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverLift({ children, className }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={ y: -4, scale: 1.02 }
      whileTap={ scale: 0.98 }
      transition={{type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
