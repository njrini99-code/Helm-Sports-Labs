/**
 * ScoutPulse Glassmorphism Design System
 * 
 * A collection of Tailwind class strings for consistent glass-style UI components.
 * Use these constants throughout the app for a cohesive neo-glassmorphism aesthetic.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Glass Cards
// ═══════════════════════════════════════════════════════════════════════════

/** Base glass card with blur, semi-transparent background, and subtle border */
export const glassCard = "backdrop-blur-2xl bg-white/5 border border-white/15 shadow-lg shadow-black/20 rounded-xl";

/** Hover effects for glass cards - lift, glow, and shadow enhancement */
export const glassCardHover = "hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 ease-out";

/** Combined glass card with hover effects */
export const glassCardInteractive = `${glassCard} ${glassCardHover}`;

// ═══════════════════════════════════════════════════════════════════════════
// Glass Buttons
// ═══════════════════════════════════════════════════════════════════════════

export const glassButton = {
  /** Primary action button - emerald gradient with glow */
  primary: "backdrop-blur-xl bg-gradient-to-br from-emerald-500/90 to-emerald-600/90 border border-white/20 shadow-lg shadow-emerald-500/30 text-white rounded-lg px-6 py-3 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300",
  
  /** Secondary button - subtle glass background */
  secondary: "backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-lg px-6 py-3 hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300",
  
  /** Ghost button - minimal, transparent */
  ghost: "backdrop-blur-xl bg-transparent border border-white/10 text-white/90 rounded-lg px-6 py-3 hover:bg-white/5 hover:border-white/20 transition-all duration-300",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Glass Inputs
// ═══════════════════════════════════════════════════════════════════════════

/** Glass-style input field */
export const glassInput = "backdrop-blur-xl bg-white/5 border border-white/15 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300";

/** Glass-style textarea */
export const glassTextarea = "backdrop-blur-xl bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 resize-none";

/** Glass-style select dropdown */
export const glassSelect = "backdrop-blur-xl bg-white/5 border border-white/15 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300";

// ═══════════════════════════════════════════════════════════════════════════
// Glass Panels & Containers
// ═══════════════════════════════════════════════════════════════════════════

/** Hero banner glass panel - extra blur and depth */
export const glassHero = "backdrop-blur-3xl bg-white/[0.08] border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl";

/** Stat card - compact glass tile */
export const glassStatCard = "backdrop-blur-lg bg-white/[0.08] border border-white/[0.12] rounded-2xl p-4 hover:-translate-y-0.5 hover:border-emerald-400/30 transition-all duration-150";

/** Large content panel - for Team Hub, College Journey, etc. */
export const glassPanel = "backdrop-blur-xl bg-white/[0.07] border border-white/[0.12] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300";

/** Dropdown/popover panel */
export const glassDropdown = "backdrop-blur-2xl bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl shadow-black/40";

// ═══════════════════════════════════════════════════════════════════════════
// Glass Pills & Badges
// ═══════════════════════════════════════════════════════════════════════════

/** Segmented control container */
export const glassSegmentedControl = "flex gap-1 p-1 bg-white/[0.06] rounded-full";

/** Active pill in segmented control */
export const glassSegmentedPillActive = "px-4 py-1.5 text-xs font-medium rounded-full bg-white text-emerald-700 transition-all duration-150";

/** Inactive pill in segmented control */
export const glassSegmentedPillInactive = "px-4 py-1.5 text-xs font-medium rounded-full text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-150";

/** Position/status badge */
export const glassBadge = "px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30";

/** Trend pill (for stats) */
export const glassTrendPill = "flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300";

// ═══════════════════════════════════════════════════════════════════════════
// Glass Backgrounds
// ═══════════════════════════════════════════════════════════════════════════

/** Dark hero zone gradient */
export const glassDarkZone = "bg-gradient-to-b from-[#0b1720] via-[#0d1f2d] to-[#0f172a]";

/** Transition gradient (dark to light) */
export const glassTransitionZone = "bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#f4f7fb]";

/** Light content zone */
export const glassLightZone = "bg-[#f4f7fb]";

/** Subtle grid pattern overlay */
export const glassGridPattern = `bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-[0.03]`;

// ═══════════════════════════════════════════════════════════════════════════
// Glass List Items
// ═══════════════════════════════════════════════════════════════════════════

/** Interactive list row (messages, events, etc.) */
export const glassListItem = "w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all duration-150";

/** Compact list row for tight spaces */
export const glassListItemCompact = "flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-150";

// ═══════════════════════════════════════════════════════════════════════════
// Utility Types
// ═══════════════════════════════════════════════════════════════════════════

export type GlassButtonVariant = keyof typeof glassButton;

