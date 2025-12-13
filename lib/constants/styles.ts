/**
 * Shared CSS class constants to eliminate duplication
 * Use these instead of copy-pasting className strings
 */

// ═══════════════════════════════════════════════════════════════════════════
// Form Input Styles
// ═══════════════════════════════════════════════════════════════════════════

export const FORM_INPUT_GLASS =
  "w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white " +
  "focus:bg-white/15 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none " +
  "transition-all duration-200";

export const FORM_INPUT_STANDARD =
  "w-full px-4 py-2 border border-gray-300 rounded-lg " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none " +
  "transition-all duration-200";

export const FORM_TEXTAREA_GLASS =
  "w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white " +
  "focus:bg-white/15 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none " +
  "resize-none transition-all duration-200";

export const FORM_TEXTAREA_STANDARD =
  "w-full px-4 py-2 border border-gray-300 rounded-lg " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none " +
  "resize-none transition-all duration-200";

export const FORM_LABEL_GLASS =
  "block text-sm font-medium text-white/90 mb-2";

export const FORM_LABEL_STANDARD =
  "block text-sm font-medium text-gray-700 mb-2";

// ═══════════════════════════════════════════════════════════════════════════
// Card Styles
// ═══════════════════════════════════════════════════════════════════════════

export const CARD_GLASS =
  "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 " +
  "hover:bg-white/15 hover:-translate-y-1 transition-all duration-200";

export const CARD_GLASS_INTERACTIVE =
  "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 " +
  "hover:bg-white/15 hover:border-white/30 hover:shadow-lg hover:-translate-y-1 " +
  "transition-all duration-200 cursor-pointer";

export const CARD_STANDARD =
  "bg-white border border-gray-200 rounded-xl p-6 shadow-sm " +
  "hover:shadow-md transition-all duration-200";

// ═══════════════════════════════════════════════════════════════════════════
// Button Styles
// ═══════════════════════════════════════════════════════════════════════════

export const BUTTON_PRIMARY_GLASS =
  "px-4 py-2 bg-blue-500/90 backdrop-blur-sm text-white rounded-lg font-medium " +
  "hover:bg-blue-600 active:scale-95 transition-all duration-200 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const BUTTON_SECONDARY_GLASS =
  "px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-medium " +
  "hover:bg-white/20 active:scale-95 transition-all duration-200 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const BUTTON_DANGER_GLASS =
  "px-3 py-1 bg-red-500/20 text-red-300 rounded-lg " +
  "hover:bg-red-500/30 active:scale-95 transition-all duration-200";

export const BUTTON_STANDARD =
  "px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg " +
  "hover:bg-blue-500/30 active:scale-95 transition-all duration-200";

// ═══════════════════════════════════════════════════════════════════════════
// Loading States
// ═══════════════════════════════════════════════════════════════════════════

export const LOADING_SPINNER =
  "w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin";

export const LOADING_CONTAINER =
  "flex items-center justify-center p-12";

export const LOADING_SPINNER_SMALL =
  "w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin";

// ═══════════════════════════════════════════════════════════════════════════
// Empty State Styles
// ═══════════════════════════════════════════════════════════════════════════

export const EMPTY_STATE_CONTAINER =
  "text-center py-12";

export const EMPTY_STATE_ICON =
  "text-6xl mb-4";

export const EMPTY_STATE_TEXT =
  "text-gray-500 mb-4";

// ═══════════════════════════════════════════════════════════════════════════
// List Item Styles
// ═══════════════════════════════════════════════════════════════════════════

export const LIST_ITEM_GLASS =
  "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 " +
  "hover:bg-white/15 transition-all duration-200";

export const LIST_ITEM_STANDARD =
  "bg-white border border-gray-200 rounded-lg p-4 " +
  "hover:bg-gray-50 transition-all duration-200";

// ═══════════════════════════════════════════════════════════════════════════
// Grid Layouts
// ═══════════════════════════════════════════════════════════════════════════

export const GRID_2_COL = "grid grid-cols-1 md:grid-cols-2 gap-4";
export const GRID_3_COL = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
export const GRID_4_COL = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Combine class strings safely (removes duplicates and falsy values)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ').trim();
}

/**
 * Get theme-aware input className
 */
export function getInputClassName(variant: 'glass' | 'standard' = 'standard'): string {
  return variant === 'glass' ? FORM_INPUT_GLASS : FORM_INPUT_STANDARD;
}

/**
 * Get theme-aware textarea className
 */
export function getTextareaClassName(variant: 'glass' | 'standard' = 'standard'): string {
  return variant === 'glass' ? FORM_TEXTAREA_GLASS : FORM_TEXTAREA_STANDARD;
}

/**
 * Get theme-aware card className
 */
export function getCardClassName(variant: 'glass' | 'standard' = 'standard', interactive = false): string {
  if (variant === 'glass') {
    return interactive ? CARD_GLASS_INTERACTIVE : CARD_GLASS;
  }
  return CARD_STANDARD;
}
