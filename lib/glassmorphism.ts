/**
 * Unified Glassmorphism Styles - Production Ready
 * Combines best features from both glassmorphism.ts and glassmorphism-enhanced.ts
 * Single source of truth for all glass effects
 */

import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// Base Glass Effects
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Standard glass card with blur effect
 * Use this as the default for most cards
 */
export const glassCard =
  "backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 " +
  "rounded-2xl shadow-xl transition-all duration-200";

/**
 * Interactive glass card with hover effects
 * Use for clickable cards and interactive elements
 */
export const glassCardInteractive =
  "backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 " +
  "rounded-2xl shadow-xl transition-all duration-200 cursor-pointer " +
  "hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.99]";

/**
 * Premium glass card with enhanced depth
 * Use for hero sections and highlighted content
 */
export const glassCardPremium =
  "backdrop-blur-xl bg-gradient-to-br from-white/15 to-white/5 " +
  "border border-white/30 dark:border-white/20 rounded-3xl shadow-2xl " +
  "transition-all duration-300 hover:shadow-3xl";

// ═══════════════════════════════════════════════════════════════════════════
// Specialized Components
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Glass hero section
 * Use for page headers and hero banners
 */
export const glassHero =
  "backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 " +
  "border border-white/30 rounded-3xl shadow-2xl p-8 md:p-12 " +
  "relative overflow-hidden";

/**
 * Glass stat card for metrics
 * Use for dashboard statistics and KPIs
 */
export const glassStatCard =
  "backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 " +
  "rounded-2xl p-6 shadow-lg transition-all duration-200 group " +
  "hover:bg-white/15 hover:shadow-xl hover:scale-105";

/**
 * Glass panel for content sections
 * Use for content containers and sections
 */
export const glassPanel =
  "backdrop-blur-lg bg-white/5 dark:bg-white/[0.02] " +
  "border border-white/10 rounded-2xl shadow-lg";

/**
 * Glass list item
 * Use for list items and rows
 */
export const glassListItem =
  "backdrop-blur-sm bg-white/5 dark:bg-white/[0.02] " +
  "border border-white/10 rounded-xl p-4 " +
  "transition-all duration-200 hover:bg-white/10 hover:border-white/20";

/**
 * Glass badge
 * Use for tags and status indicators
 */
export const glassBadge =
  "backdrop-blur-md bg-white/20 dark:bg-white/10 " +
  "border border-white/30 rounded-full px-3 py-1 " +
  "text-xs font-medium";

// ═══════════════════════════════════════════════════════════════════════════
// Button Variants
// ═══════════════════════════════════════════════════════════════════════════

export const glassButton = {
  primary:
    "backdrop-blur-md bg-gradient-to-br from-blue-500/90 to-blue-600/90 " +
    "border border-white/20 text-white font-medium px-4 py-2 rounded-xl " +
    "shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 " +
    "transition-all duration-200",

  secondary:
    "backdrop-blur-md bg-white/10 dark:bg-white/5 " +
    "border border-white/20 text-white font-medium px-4 py-2 rounded-xl " +
    "shadow-md hover:bg-white/20 hover:shadow-lg hover:scale-105 active:scale-95 " +
    "transition-all duration-200",

  ghost:
    "backdrop-blur-sm bg-transparent border border-white/20 " +
    "text-white font-medium px-4 py-2 rounded-xl " +
    "hover:bg-white/10 hover:border-white/30 " +
    "transition-all duration-200",

  danger:
    "backdrop-blur-md bg-gradient-to-br from-red-500/90 to-red-600/90 " +
    "border border-white/20 text-white font-medium px-4 py-2 rounded-xl " +
    "shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 " +
    "transition-all duration-200",
};

// ═══════════════════════════════════════════════════════════════════════════
// Form Elements
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Glass input field
 * Use for text inputs and form fields
 */
export const glassInput =
  "backdrop-blur-md bg-white/10 dark:bg-white/5 " +
  "border border-white/20 rounded-lg px-4 py-2 " +
  "text-white placeholder:text-white/50 " +
  "focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 " +
  "outline-none transition-all duration-200";

/**
 * Glass textarea
 */
export const glassTextarea =
  "backdrop-blur-md bg-white/10 dark:bg-white/5 " +
  "border border-white/20 rounded-lg px-4 py-2 " +
  "text-white placeholder:text-white/50 resize-none " +
  "focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 " +
  "outline-none transition-all duration-200";

/**
 * Glass select dropdown
 */
export const glassSelect =
  "backdrop-blur-md bg-white/10 dark:bg-white/5 " +
  "border border-white/20 rounded-lg px-4 py-2 " +
  "text-white cursor-pointer " +
  "focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 " +
  "outline-none transition-all duration-200";

// ═══════════════════════════════════════════════════════════════════════════
// Zone Effects (Background Sections)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dark zone for dramatic backgrounds
 * Use for hero sections and featured areas
 */
export const glassDarkZone =
  "relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 " +
  "before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/10 before:via-purple-500/10 before:to-transparent " +
  "before:pointer-events-none";

/**
 * Light zone for subtle backgrounds
 * Use for content areas and lighter sections
 */
export const glassLightZone =
  "relative bg-gradient-to-br from-slate-50 via-white to-slate-50 " +
  "before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-purple-500/5 before:to-transparent " +
  "before:pointer-events-none";

/**
 * Transition zone for smooth gradients
 * Use between dark and light sections
 */
export const glassTransitionZone =
  "relative bg-gradient-to-b from-transparent via-slate-500/5 to-transparent " +
  "h-20 pointer-events-none";

// ═══════════════════════════════════════════════════════════════════════════
// Utility Classes
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Frosted glass overlay
 * Use for modals and overlays
 */
export const glassFrostedOverlay =
  "fixed inset-0 backdrop-blur-md bg-black/20 " +
  "transition-opacity duration-200";

/**
 * Glass divider
 * Use for visual separation
 */
export const glassDivider =
  "h-px bg-gradient-to-r from-transparent via-white/20 to-transparent";

/**
 * Glass glow effect (add to parent)
 * Creates a subtle glow around elements
 */
export const glassGlow =
  "relative after:absolute after:inset-0 after:rounded-[inherit] " +
  "after:shadow-[0_0_40px_rgba(255,255,255,0.1)] after:pointer-events-none";

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get glass variant by name
 * @param variant - The glass variant name
 * @param options - Additional options
 */
export function getGlassVariant(
  variant: 'card' | 'hero' | 'panel' | 'stat' | 'list',
  options?: {
    interactive?: boolean;
    premium?: boolean;
  }
): string {
  const { interactive = false, premium = false } = options || {};

  switch (variant) {
    case 'card':
      if (premium) return glassCardPremium;
      if (interactive) return glassCardInteractive;
      return glassCard;
    case 'hero':
      return glassHero;
    case 'panel':
      return glassPanel;
    case 'stat':
      return glassStatCard;
    case 'list':
      return glassListItem;
    default:
      return glassCard;
  }
}

/**
 * Combine glass styles with custom classes
 */
export function glassStyle(...classes: (string | boolean | undefined | null)[]): string {
  return cn(...classes);
}

// ═══════════════════════════════════════════════════════════════════════════
// Performance Optimization Utilities
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add will-change for blur performance
 * Use sparingly - only on animated glass elements
 */
export const glassOptimized = "will-change-[backdrop-filter]";

/**
 * Reduced motion variant (accessibility)
 * Use for users who prefer reduced motion
 */
export const glassReducedMotion = "motion-reduce:backdrop-blur-none motion-reduce:bg-white/20";
