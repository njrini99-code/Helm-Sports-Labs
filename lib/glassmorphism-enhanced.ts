/**
 * Enhanced Glassmorphism Design System
 * 
 * Ultimate modern glassmorphism patterns with advanced effects,
 * animations, and interactive states for premium UI experiences.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Advanced Glass Cards
// ═══════════════════════════════════════════════════════════════════════════

/** Premium glass card with multi-layer depth */
export const glassCardPremium = `
  backdrop-blur-2xl 
  bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.05]
  border border-white/20 
  shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
  rounded-2xl
  relative
  overflow-hidden
  before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none
`;

/** Interactive glass card with hover glow */
export const glassCardInteractive = `
  ${glassCardPremium}
  transition-all duration-500 ease-out
  hover:shadow-[0_12px_48px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]
  hover:border-emerald-400/30
  hover:-translate-y-1
  hover:scale-[1.02]
  group
`;

/** Glass stat card with animated border */
export const glassStatCard = `
  backdrop-blur-xl
  bg-white/[0.08]
  border border-white/[0.15]
  rounded-xl
  p-4
  relative
  overflow-hidden
  transition-all duration-300
  hover:bg-white/[0.12]
  hover:border-emerald-400/30
  hover:-translate-y-0.5
  hover:shadow-lg hover:shadow-emerald-500/10
  group
  before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300
  hover:before:opacity-100
`;

/** Glass panel for large content areas */
export const glassPanel = `
  backdrop-blur-2xl
  bg-gradient-to-br from-white/[0.1] via-white/[0.07] to-white/[0.05]
  border border-white/[0.15]
  rounded-3xl
  shadow-[0_20px_60px_rgba(0,0,0,0.4)]
  relative
  overflow-hidden
  before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:pointer-events-none
  transition-all duration-500
  hover:border-white/25
  hover:shadow-[0_25px_70px_rgba(0,0,0,0.5)]
`;

/** Glass hero banner with depth */
export const glassHero = `
  backdrop-blur-3xl
  bg-gradient-to-br from-white/[0.15] via-white/[0.1] to-white/[0.08]
  border border-white/[0.2]
  rounded-3xl
  shadow-[0_25px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]
  relative
  overflow-hidden
  before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/10 before:via-transparent before:to-blue-500/10 before:pointer-events-none
  after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)] after:pointer-events-none
`;

// ═══════════════════════════════════════════════════════════════════════════
// Glass Buttons
// ═══════════════════════════════════════════════════════════════════════════

export const glassButton = {
  /** Primary action with gradient glow */
  primary: `
    backdrop-blur-xl
    bg-gradient-to-r from-emerald-500/90 via-emerald-500/95 to-emerald-600/90
    border border-white/30
    shadow-[0_4px_20px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
    text-white
    font-semibold
    rounded-xl
    px-6 py-3
    transition-all duration-300
    hover:shadow-[0_6px_30px_rgba(16,185,129,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]
    hover:-translate-y-0.5
    hover:scale-[1.02]
    active:scale-[0.98]
    relative
    overflow-hidden
    before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300
    hover:before:opacity-100
  `,
  
  /** Secondary glass button */
  secondary: `
    backdrop-blur-xl
    bg-white/[0.12]
    border border-white/25
    text-white
    font-medium
    rounded-xl
    px-6 py-3
    transition-all duration-300
    hover:bg-white/[0.18]
    hover:border-white/35
    hover:-translate-y-0.5
    hover:shadow-lg hover:shadow-white/10
    active:scale-[0.98]
  `,
  
  /** Ghost button with subtle glow */
  ghost: `
    backdrop-blur-xl
    bg-transparent
    border border-white/15
    text-white/90
    font-medium
    rounded-xl
    px-6 py-3
    transition-all duration-300
    hover:bg-white/[0.08]
    hover:border-white/25
    hover:text-white
    active:scale-[0.98]
  `,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Glass Inputs
// ═══════════════════════════════════════════════════════════════════════════

export const glassInput = `
  backdrop-blur-xl
  bg-white/[0.08]
  border border-white/[0.2]
  rounded-xl
  px-4 py-3
  text-white
  placeholder-white/40
  transition-all duration-300
  focus:bg-white/[0.12]
  focus:border-emerald-400/50
  focus:ring-2 focus:ring-emerald-500/20
  focus:shadow-[0_0_20px_rgba(16,185,129,0.2)]
`;

// ═══════════════════════════════════════════════════════════════════════════
// Glass Backgrounds & Zones
// ═══════════════════════════════════════════════════════════════════════════

/** Dark hero zone with animated gradient */
export const glassDarkZone = `
  bg-gradient-to-b from-[#0a0f1a] via-[#0d1520] to-[#0f172a]
  relative
  overflow-hidden
  before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_50%)] before:pointer-events-none
  after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.08),transparent_50%)] after:pointer-events-none
`;

/** Transition zone with smooth gradient */
export const glassTransitionZone = `
  bg-gradient-to-b from-[#0f172a] via-[#1a2332] to-[#f4f7fb]
  relative
  overflow-hidden
`;

/** Light content zone */
export const glassLightZone = `
  bg-gradient-to-b from-[#f4f7fb] via-white to-[#f8fafc]
  relative
`;

// ═══════════════════════════════════════════════════════════════════════════
// Glass List Items
// ═══════════════════════════════════════════════════════════════════════════

export const glassListItem = `
  backdrop-blur-lg
  bg-white/[0.05]
  border border-white/[0.1]
  rounded-xl
  p-4
  transition-all duration-300
  hover:bg-white/[0.1]
  hover:border-white/[0.2]
  hover:shadow-lg hover:shadow-black/10
  hover:-translate-y-0.5
  group
  cursor-pointer
`;

// ═══════════════════════════════════════════════════════════════════════════
// Glass Badges & Pills
// ═══════════════════════════════════════════════════════════════════════════

export const glassBadge = `
  backdrop-blur-lg
  bg-emerald-500/20
  border border-emerald-400/30
  text-emerald-300
  rounded-full
  px-3 py-1
  text-xs font-medium
  shadow-[0_2px_10px_rgba(16,185,129,0.2)]
`;

export const glassPill = `
  backdrop-blur-lg
  bg-white/[0.1]
  border border-white/[0.2]
  text-white/90
  rounded-full
  px-4 py-1.5
  text-sm font-medium
  transition-all duration-300
  hover:bg-white/[0.15]
  hover:border-white/30
`;

// ═══════════════════════════════════════════════════════════════════════════
// Glass Segmented Controls
// ═══════════════════════════════════════════════════════════════════════════

export const glassSegmentedControl = `
  backdrop-blur-xl
  bg-white/[0.08]
  border border-white/[0.15]
  rounded-full
  p-1
  inline-flex
  gap-1
`;

export const glassSegmentedPill = {
  active: `
    bg-white
    text-emerald-700
    font-semibold
    shadow-lg shadow-emerald-500/20
    rounded-full
    px-4 py-2
    transition-all duration-300
  `,
  inactive: `
    text-white/70
    rounded-full
    px-4 py-2
    transition-all duration-300
    hover:text-white
    hover:bg-white/[0.05]
  `,
};

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════
// Note: cn() utility is exported from @/lib/utils - import from there instead

/** Apply glassmorphism with custom opacity */
export function glassWithOpacity(opacity: number) {
  return `
    backdrop-blur-2xl
    bg-white/[${opacity}]
    border border-white/[${opacity * 1.5}]
  `;
}
