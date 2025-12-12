'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { pageTransition, staggerContainer, staggerItem } from '@/lib/animations';
import { ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// Page Wrapper with Animation
// ═══════════════════════════════════════════════════════════════════════════
export interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  /** Animation variant */
  animation?: 'fade' | 'slide' | 'scale' | 'none';
  /** Custom animation delay */
  delay?: number;
}

export function PageWrapper({
  children,
  className,
  animation = 'fade',
  delay = 0,
}: PageWrapperProps) {
  if (animation === 'none') {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
    },
  };

  return (
    <motion.div
      className={className}
      initial={variants[animation].initial}
      animate={variants[animation].animate}
      exit={variants[animation].exit}
      transition={{duration: 0.3, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Staggered Container (for lists/grids)
// ═══════════════════════════════════════════════════════════════════════════
export interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  /** Delay between each child animation */
  staggerDelay?: number;
  /** Initial delay before animations start */
  delayStart?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  delayStart = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delayStart,
          },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Staggered Item (child of StaggerContainer)
// ═══════════════════════════════════════════════════════════════════════════
export interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function StaggerItem({
  children,
  className,
  direction = 'up',
}: StaggerItemProps) {
  const directionVariants = {
    up: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
  };

  return (
    <motion.div
      className={className}
      variants={{
        hidden: directionVariants[direction].hidden,
        visible: {
          ...directionVariants[direction].visible,
          transition: { duration: 0.3, ease: 'easeOut' },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Fade In View (animate when in viewport)
// ═══════════════════════════════════════════════════════════════════════════
export interface FadeInViewProps {
  children: ReactNode;
  className?: string;
  /** Only animate once */
  once?: boolean;
  /** Animation delay */
  delay?: number;
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function FadeInView({
  children,
  className,
  once = true,
  delay = 0,
  direction = 'up',
}: FadeInViewProps) {
  const directionVariants = {
    up: { initial: { y: 30 }, animate: { y: 0 } },
    down: { initial: { y: -30 }, animate: { y: 0 } },
    left: { initial: { x: 30 }, animate: { x: 0 } },
    right: { initial: { x: -30 }, animate: { x: 0 } },
    none: { initial: {}, animate: {} },
  };

  return (
    <motion.div
      className={className}
      initial={ opacity: 0, ...directionVariants[direction].initial }
      whileInView={ opacity: 1, ...directionVariants[direction].animate }
      viewport={ once, margin: '-50px' }
      transition={{duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Animated Card (hover effects)
// ═══════════════════════════════════════════════════════════════════════════
export interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  /** Enable hover animation */
  hover?: boolean;
  /** Enable tap animation */
  tap?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  hover = true,
  tap = true,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={cn(className, onClick && 'cursor-pointer')}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={tap ? { scale: 0.98 } : undefined}
      transition={{duration: 0.2 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section Reveal (for page sections)
// ═══════════════════════════════════════════════════════════════════════════
export interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  /** Section index for stagger delay */
  index?: number;
}

export function SectionReveal({
  children,
  className,
  index = 0,
}: SectionRevealProps) {
  return (
    <motion.section
      className={className}
      initial={ opacity: 0, y: 20 }
      animate={ opacity: 1, y: 0 }
      transition={{duration: 0.4, 
        ease: 'easeOut', 
        delay: 0.1 + index * 0.1 
      }}
    >
      {children}
    </motion.section>
  );
}

export default PageWrapper;


