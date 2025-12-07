// ═══════════════════════════════════════════════════════════════════════════
// ScoutPulse Animation Utilities
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// Page Transition Variants
// ═══════════════════════════════════════════════════════════════════════════
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const pageTransitionFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const pageTransitionSlide = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

// ═══════════════════════════════════════════════════════════════════════════
// Card & Container Animations
// ═══════════════════════════════════════════════════════════════════════════
export const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  hover: { 
    scale: 1.02, 
    y: -2,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// List Animations
// ═══════════════════════════════════════════════════════════════════════════
export const listContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const listItem = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0, 
    x: 10,
    transition: { duration: 0.15 }
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Modal & Overlay Animations
// ═══════════════════════════════════════════════════════════════════════════
export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const slidePanel = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { type: 'spring', damping: 30, stiffness: 300 },
};

export const slidePanelLeft = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
  transition: { type: 'spring', damping: 30, stiffness: 300 },
};

// ═══════════════════════════════════════════════════════════════════════════
// Button & Interaction Animations
// ═══════════════════════════════════════════════════════════════════════════
export const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export const iconButtonVariants = {
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.9 },
};

// ═══════════════════════════════════════════════════════════════════════════
// Stat & Number Animations
// ═══════════════════════════════════════════════════════════════════════════
export const countUp = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', damping: 15, stiffness: 200 }
  },
};

export const progressBar = {
  initial: { width: 0 },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: { duration: 1, ease: 'easeOut', delay: 0.3 }
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// Notification & Toast Animations
// ═══════════════════════════════════════════════════════════════════════════
export const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.9 },
  transition: { type: 'spring', damping: 20, stiffness: 300 },
};

export const notificationBadge = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: { type: 'spring', damping: 10, stiffness: 400 }
  },
  exit: { scale: 0 },
};

// ═══════════════════════════════════════════════════════════════════════════
// Hero & Section Animations
// ═══════════════════════════════════════════════════════════════════════════
export const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const heroTitle = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

export const heroSubtitle = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut', delay: 0.1 }
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Floating/Ambient Animations (for backgrounds)
// ═══════════════════════════════════════════════════════════════════════════
export const floatingOrb = {
  animate: {
    y: [0, -20, 0],
    x: [0, 10, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 8,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

export const pulseGlow = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.1, 1],
    transition: {
      duration: 4,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create stagger delay for list items
 */
export function getStaggerDelay(index: number, baseDelay = 0.05): number {
  return index * baseDelay;
}

/**
 * Create custom spring animation
 */
export function createSpring(damping = 20, stiffness = 300) {
  return { type: 'spring' as const, damping, stiffness };
}

/**
 * Create custom tween animation
 */
export function createTween(duration = 0.3, ease = 'easeOut') {
  return { type: 'tween' as const, duration, ease };
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS Animation Classes (for non-Framer Motion usage)
// ═══════════════════════════════════════════════════════════════════════════
export const cssAnimationClasses = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-200',
  slideInRight: 'animate-in slide-in-from-right duration-300',
  slideInLeft: 'animate-in slide-in-from-left duration-300',
  slideInUp: 'animate-in slide-in-from-bottom duration-300',
  slideInDown: 'animate-in slide-in-from-top duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-150',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
};


