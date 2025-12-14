# 🚢 Helm Sports Labs - Complete UI Redesign Guide

## Executive Summary

This document outlines a complete visual rebrand and UI modernization of the recruiting platform from "ScoutPulse" to **Helm Sports Labs**. The redesign introduces a sophisticated frosted glass design system with a maritime-inspired identity that positions the platform as the premium solution for baseball and golf recruiting.

**Design Philosophy**: "Navigate Your Recruiting Journey" - Like a ship's helm guides voyagers to their destination, Helm Sports Labs guides athletes to their future.

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Glassmorphism Design System](#glassmorphism-design-system)
5. [Landing Page Redesign](#landing-page-redesign)
6. [Dashboard Makeover](#dashboard-makeover)
7. [Component Library](#component-library)
8. [Implementation Checklist](#implementation-checklist)

---

## Brand Identity

### Logo System

**Primary Logo**: Ship's Helm (Green) - `helm-logo.png`
- **Usage**: Landing page, marketing materials, app icon
- **Placement**: Header, footer, loading screens
- **Size**: 48x48px (small), 96x96px (medium), 192x192px (large)

**Baseball Logo**: Helm with Baseball - `baseball-helm-logo.png`
- **Usage**: Baseball recruiting dashboard, sign-in pages, navigation
- **Placement**: Baseball dashboard header, baseball-specific features
- **Color**: Matches brand green (#1B7651)

**Golf Logo**: Helm with Golf Ball - `golf-helm-logo.png`
- **Usage**: Golf recruiting section (coming soon placeholder)
- **Placement**: Golf landing section, future golf dashboard
- **Color**: Matches brand green (#1B7651)

### Brand Name

**Full Name**: Helm Sports Labs
**Short Name**: Helm
**Tagline**: "Navigate Your Recruiting Journey"

Replace all instances of:
- `ScoutPulse` → `Helm Sports Labs`
- `SP` logo → Ship helm logo
- `Scout<span>Pulse</span>` → `Helm Sports <span>Labs</span>`

---

## Color System

### Primary Palette (Extracted from Logos)

```typescript
// tailwind.config.ts - NEW COLOR SYSTEM

colors: {
  helm: {
    // Primary Green (from logo)
    green: {
      50: '#F0FDF9',    // Very light mint background
      100: '#CCFBEF',   // Light mint for highlights
      200: '#99F6E0',   // Soft mint for hover states
      300: '#5FECC8',   // Medium mint
      400: '#2DD4AA',   // Active mint
      500: '#1B7651',   // PRIMARY BRAND GREEN (logo color)
      600: '#166B49',   // Darker green for hover
      700: '#115839',   // Deep green for text
      800: '#0D4429',   // Very deep green
      900: '#09301C',   // Almost black green
      950: '#051A10',   // Darkest (backgrounds)
    },

    // Cream Secondary (warm, inviting)
    cream: {
      50: '#FDFCFB',    // Almost white
      100: '#FAF8F5',   // Very light cream
      200: '#F5F1EA',   // Light cream (primary cream)
      300: '#EDE6D9',   // Medium cream
      400: '#E0D4C0',   // Darker cream
      500: '#D1C0A8',   // Deep cream
      600: '#B8A588',   // Muted cream
      700: '#9A8768',   // Brown cream
      800: '#786B52',   // Dark brown
      900: '#574D3B',   // Very dark brown
    },

    // Accent Colors
    ocean: {
      500: '#0891B2',   // Cyan blue (ocean metaphor)
      600: '#0E7490',   // Darker ocean
    },
    sand: {
      500: '#D6C9B8',   // Sandy beige
    },
    sunset: {
      500: '#FB923C',   // Warm orange for alerts/CTAs
    },
  },

  // Semantic Colors
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  // ... rest of semantic colors
}
```

### Color Usage Guidelines

| Element | Light Mode | Dark Mode | Usage |
|---------|-----------|-----------|-------|
| **Page Background** | `helm-cream-50` | `helm-green-950` | Main app background |
| **Card Background** | `helm-cream-100/80` + blur | `helm-green-900/30` + blur | Frosted glass cards |
| **Primary Action** | `helm-green-500` | `helm-green-400` | Buttons, links, CTAs |
| **Text Primary** | `helm-green-900` | `helm-cream-50` | Headlines, body text |
| **Text Secondary** | `helm-green-700` | `helm-cream-300` | Supporting text |
| **Border** | `helm-green-500/10` | `helm-green-400/10` | Card borders, dividers |
| **Accent** | `helm-ocean-500` | `helm-ocean-500` | Highlights, badges |
| **Success** | `helm-green-500` | `helm-green-400` | Success states |
| **Warning** | `helm-sunset-500` | `helm-sunset-500` | Warnings, alerts |

### Gradient System

```css
/* Primary Brand Gradient */
.helm-gradient-primary {
  background: linear-gradient(135deg, #1B7651 0%, #0E4429 100%);
}

/* Subtle Background Gradient */
.helm-gradient-bg-light {
  background: linear-gradient(180deg, #FDFCFB 0%, #F5F1EA 100%);
}

.helm-gradient-bg-dark {
  background: linear-gradient(180deg, #051A10 0%, #09301C 100%);
}

/* Glass Gradient Overlay */
.helm-glass-gradient {
  background: linear-gradient(
    135deg,
    rgba(27, 118, 81, 0.05) 0%,
    rgba(27, 118, 81, 0.02) 100%
  );
}

/* Accent Glow */
.helm-glow {
  box-shadow: 0 0 40px rgba(27, 118, 81, 0.3);
}
```

---

## Typography

### Font Stack

**Primary Font**: Inter (modern, highly readable)
**Monospace Font**: JetBrains Mono (for code, stats)

```css
/* app/globals.css */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}
```

### Typography Scale

```typescript
// tailwind.config.ts

fontSize: {
  // Headings
  'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '800' }],     // 72px - Hero headlines
  'h1': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],      // 60px
  'h2': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],         // 48px
  'h3': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],      // 36px
  'h4': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],                               // 30px
  'h5': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],                                 // 24px
  'h6': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],                                // 20px

  // Body
  'body-xl': ['1.25rem', { lineHeight: '1.7', fontWeight: '400' }],     // 20px - Large body
  'body-lg': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],    // 18px - Default large
  'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],           // 16px - Default
  'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],    // 14px - Small
  'body-xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],     // 12px - Extra small

  // UI Elements
  'button-lg': ['1rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '600' }],
  'button': ['0.875rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '600' }],
  'button-sm': ['0.75rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '600' }],
  'caption': ['0.75rem', { lineHeight: '1.3', fontWeight: '500' }],     // Labels, captions
  'overline': ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.1em', fontWeight: '700' }], // All caps labels
}
```

### Typography Classes

```css
/* Heading styles with proper visual hierarchy */
.helm-heading-display {
  @apply font-sans text-display font-extrabold tracking-tight;
  @apply bg-gradient-to-br from-helm-green-700 to-helm-green-900 bg-clip-text text-transparent;
}

.helm-heading-1 {
  @apply font-sans text-h1 font-bold tracking-tight text-helm-green-900 dark:text-helm-cream-50;
}

.helm-heading-2 {
  @apply font-sans text-h2 font-bold tracking-tight text-helm-green-800 dark:text-helm-cream-100;
}

.helm-heading-3 {
  @apply font-sans text-h3 font-semibold text-helm-green-800 dark:text-helm-cream-100;
}

/* Body text */
.helm-body {
  @apply font-sans text-body text-helm-green-700 dark:text-helm-cream-200 leading-relaxed;
}

.helm-body-large {
  @apply font-sans text-body-lg text-helm-green-700 dark:text-helm-cream-200 leading-relaxed;
}

/* Special text styles */
.helm-text-accent {
  @apply text-helm-green-500 font-semibold;
}

.helm-text-muted {
  @apply text-helm-green-600 dark:text-helm-cream-400 text-body-sm;
}
```

---

## Glassmorphism Design System

### Core Glass Properties

```css
/* lib/glassmorphism-helm.ts */

// Base Glass Effect
.helm-glass-base {
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
}

// Light Mode Glass
.helm-glass-light {
  background: rgba(253, 252, 251, 0.75);        /* helm-cream-50 with 75% opacity */
  border: 1px solid rgba(27, 118, 81, 0.08);    /* helm-green-500 with 8% opacity */
  box-shadow:
    0 8px 32px rgba(27, 118, 81, 0.08),         /* Subtle green shadow */
    inset 0 1px 0 rgba(255, 255, 255, 0.8);     /* Top highlight */
}

// Dark Mode Glass
.helm-glass-dark {
  background: rgba(9, 48, 28, 0.4);              /* helm-green-900 with 40% opacity */
  border: 1px solid rgba(27, 118, 81, 0.15);    /* helm-green-500 with 15% opacity */
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),              /* Deeper shadow in dark mode */
    inset 0 1px 0 rgba(27, 118, 81, 0.1);       /* Subtle top highlight */
}
```

### Glass Component Variants

```typescript
// lib/glassmorphism-helm.ts

export const helmGlass = {
  // Card - Standard content cards
  card: cn(
    'relative overflow-hidden rounded-3xl',
    'backdrop-blur-2xl',
    // Light mode
    'bg-helm-cream-100/80',
    'border border-helm-green-500/10',
    'shadow-lg shadow-helm-green-500/5',
    // Dark mode
    'dark:bg-helm-green-900/30',
    'dark:border-helm-green-400/15',
    'dark:shadow-xl dark:shadow-black/20',
    // Transitions
    'transition-all duration-300',
  ),

  // Card Interactive - Hoverable cards
  cardInteractive: cn(
    'relative overflow-hidden rounded-3xl cursor-pointer',
    'backdrop-blur-2xl',
    // Light mode
    'bg-helm-cream-100/80',
    'border border-helm-green-500/10',
    'shadow-lg shadow-helm-green-500/5',
    'hover:bg-helm-cream-50/90',
    'hover:border-helm-green-500/20',
    'hover:shadow-xl hover:shadow-helm-green-500/15',
    'hover:-translate-y-1',
    // Dark mode
    'dark:bg-helm-green-900/30',
    'dark:border-helm-green-400/15',
    'dark:shadow-xl dark:shadow-black/20',
    'dark:hover:bg-helm-green-900/50',
    'dark:hover:border-helm-green-400/25',
    'dark:hover:shadow-2xl dark:hover:shadow-helm-green-500/20',
    // Transitions
    'transition-all duration-300 ease-out',
  ),

  // Button Primary - Main CTAs
  buttonPrimary: cn(
    'relative overflow-hidden rounded-2xl px-8 py-3.5',
    'backdrop-blur-xl',
    'bg-helm-green-500',
    'border border-helm-green-600/20',
    'text-white font-semibold text-button',
    'shadow-lg shadow-helm-green-500/30',
    'hover:bg-helm-green-600',
    'hover:shadow-xl hover:shadow-helm-green-500/40',
    'hover:scale-105',
    'active:scale-95',
    // Dark mode
    'dark:bg-helm-green-400',
    'dark:border-helm-green-300/20',
    'dark:text-helm-green-950',
    'dark:hover:bg-helm-green-300',
    'dark:shadow-helm-green-400/30',
    'dark:hover:shadow-helm-green-400/40',
    // Transitions
    'transition-all duration-200 ease-out',
  ),

  // Button Secondary - Secondary actions
  buttonSecondary: cn(
    'relative overflow-hidden rounded-2xl px-8 py-3.5',
    'backdrop-blur-xl',
    'bg-helm-cream-100/60',
    'border border-helm-green-500/15',
    'text-helm-green-700 font-semibold text-button',
    'shadow-md shadow-helm-green-500/5',
    'hover:bg-helm-cream-50/80',
    'hover:border-helm-green-500/25',
    'hover:shadow-lg hover:shadow-helm-green-500/10',
    'hover:scale-105',
    'active:scale-95',
    // Dark mode
    'dark:bg-helm-green-800/40',
    'dark:border-helm-green-400/20',
    'dark:text-helm-cream-100',
    'dark:hover:bg-helm-green-800/60',
    'dark:hover:border-helm-green-400/30',
    // Transitions
    'transition-all duration-200 ease-out',
  ),

  // Panel - Larger content areas
  panel: cn(
    'relative overflow-hidden rounded-3xl',
    'backdrop-blur-3xl',
    'bg-helm-cream-50/90',
    'border border-helm-green-500/10',
    'shadow-2xl shadow-helm-green-500/10',
    // Dark mode
    'dark:bg-helm-green-900/40',
    'dark:border-helm-green-400/15',
    'dark:shadow-2xl dark:shadow-black/30',
    // Transitions
    'transition-all duration-300',
  ),

  // Hero - Landing page hero sections
  hero: cn(
    'relative overflow-hidden rounded-[2rem]',
    'backdrop-blur-3xl',
    'bg-gradient-to-br from-helm-cream-50/95 to-helm-cream-100/95',
    'border border-helm-green-500/15',
    'shadow-2xl shadow-helm-green-500/20',
    // Dark mode
    'dark:from-helm-green-950/60 dark:to-helm-green-900/60',
    'dark:border-helm-green-400/20',
    'dark:shadow-2xl dark:shadow-black/40',
  ),

  // Stat Card - Dashboard metrics
  statCard: cn(
    'relative overflow-hidden rounded-2xl p-6',
    'backdrop-blur-xl',
    'bg-helm-cream-100/70',
    'border border-helm-green-500/10',
    'shadow-md shadow-helm-green-500/5',
    'hover:bg-helm-cream-50/80',
    'hover:border-helm-green-500/20',
    'hover:shadow-lg hover:shadow-helm-green-500/15',
    // Dark mode
    'dark:bg-helm-green-900/30',
    'dark:border-helm-green-400/15',
    'dark:hover:bg-helm-green-900/45',
    'dark:hover:border-helm-green-400/25',
    'dark:shadow-xl dark:shadow-black/15',
    // Transitions
    'transition-all duration-300',
  ),

  // Input - Form inputs
  input: cn(
    'relative rounded-xl px-4 py-3',
    'backdrop-blur-xl',
    'bg-helm-cream-50/60',
    'border border-helm-green-500/15',
    'text-helm-green-900 placeholder:text-helm-green-600/50',
    'shadow-sm shadow-helm-green-500/5',
    'focus:bg-helm-cream-50/80',
    'focus:border-helm-green-500/30',
    'focus:shadow-md focus:shadow-helm-green-500/15',
    'focus:ring-2 focus:ring-helm-green-500/20',
    // Dark mode
    'dark:bg-helm-green-900/30',
    'dark:border-helm-green-400/20',
    'dark:text-helm-cream-100',
    'dark:placeholder:text-helm-cream-400/50',
    'dark:focus:bg-helm-green-900/50',
    'dark:focus:border-helm-green-400/40',
    'dark:focus:ring-helm-green-400/20',
    // Transitions
    'transition-all duration-200',
  ),

  // Badge - Status indicators
  badge: cn(
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
    'backdrop-blur-xl',
    'bg-helm-cream-100/80',
    'border border-helm-green-500/20',
    'text-helm-green-700 text-body-sm font-semibold',
    'shadow-sm shadow-helm-green-500/10',
    // Dark mode
    'dark:bg-helm-green-900/40',
    'dark:border-helm-green-400/25',
    'dark:text-helm-cream-100',
  ),

  // Navbar - Navigation bar
  navbar: cn(
    'sticky top-0 z-50',
    'backdrop-blur-2xl',
    'bg-helm-cream-50/80',
    'border-b border-helm-green-500/10',
    'shadow-lg shadow-helm-green-500/5',
    // Dark mode
    'dark:bg-helm-green-950/80',
    'dark:border-helm-green-400/15',
    'dark:shadow-xl dark:shadow-black/20',
  ),

  // Footer
  footer: cn(
    'relative',
    'backdrop-blur-2xl',
    'bg-helm-cream-100/70',
    'border-t border-helm-green-500/10',
    'shadow-lg shadow-helm-green-500/5',
    // Dark mode
    'dark:bg-helm-green-950/70',
    'dark:border-helm-green-400/15',
  ),
};

// Glass Backgrounds with subtle patterns
export const helmGlassBackgrounds = {
  // Mesh gradient background
  mesh: 'bg-gradient-to-br from-helm-cream-50 via-helm-cream-100 to-helm-green-50 dark:from-helm-green-950 dark:via-helm-green-900 dark:to-black',

  // Subtle grid pattern
  grid: `
    bg-[linear-gradient(to_right,rgba(27,118,81,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(27,118,81,0.03)_1px,transparent_1px)]
    bg-[size:4rem_4rem]
    dark:bg-[linear-gradient(to_right,rgba(27,118,81,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(27,118,81,0.06)_1px,transparent_1px)]
  `,

  // Radial glow
  radial: 'bg-[radial-gradient(ellipse_at_top,rgba(27,118,81,0.1),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(27,118,81,0.15),transparent_50%)]',
};
```

---

## Landing Page Redesign

### Hero Section (COMPLETE OVERHAUL)

**Current Issues**:
- Generic "ScoutPulse" branding
- Basic text layout
- Emerald green doesn't match logo
- Font looks dated
- No visual hierarchy
- Lacks premium feel

**New Design**:

```tsx
// components/landing/HeroSectionHelm.tsx

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Compass, Ship, Anchor } from 'lucide-react';
import { helmGlass, helmGlassBackgrounds } from '@/lib/glassmorphism-helm';
import { cn } from '@/lib/utils';

export function HeroSectionHelm() {
  return (
    <section className="relative min-h-[100vh] overflow-hidden flex items-center">
      {/* Background - Maritime Theme */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className={cn(
          'absolute inset-0',
          helmGlassBackgrounds.mesh
        )} />

        {/* Animated grid */}
        <div className={cn(
          'absolute inset-0',
          helmGlassBackgrounds.grid,
          'animate-pulse-slow opacity-40'
        )} />

        {/* Radial glow */}
        <div className={cn(
          'absolute inset-0',
          helmGlassBackgrounds.radial
        )} />

        {/* Floating elements - nautical theme */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated compass rose */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute top-1/4 right-1/4 opacity-5 dark:opacity-10"
          >
            <Compass className="w-64 h-64 text-helm-green-500" />
          </motion.div>

          {/* Floating anchor */}
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-1/4 left-1/4 opacity-5 dark:opacity-10"
          >
            <Anchor className="w-48 h-48 text-helm-green-500" />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Logo + Name */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-4"
              >
                <Image
                  src="/helm-logo.png"
                  alt="Helm Sports Labs"
                  width={80}
                  height={80}
                  className="drop-shadow-2xl"
                />
                <div>
                  <h1 className="text-h4 font-bold text-helm-green-800 dark:text-helm-cream-100">
                    Helm Sports Labs
                  </h1>
                  <p className="text-body-sm text-helm-green-600 dark:text-helm-cream-400 font-medium">
                    Navigate Your Recruiting Journey
                  </p>
                </div>
              </motion.div>

              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  helmGlass.badge,
                  'inline-flex items-center gap-2'
                )}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-helm-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-helm-green-500" />
                </span>
                <span className="text-helm-green-700 dark:text-helm-cream-100 font-semibold text-body-sm">
                  Trusted by 10,000+ Student Athletes
                </span>
              </motion.div>

              {/* Main Headline */}
              <div className="space-y-4">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="helm-heading-display text-display leading-none"
                >
                  Navigate Your{' '}
                  <span className="relative inline-block">
                    <span className="text-helm-green-500">Future</span>
                    <motion.div
                      className="absolute -bottom-2 left-0 right-0 h-1 bg-helm-green-500/30 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    />
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="helm-body-large text-body-xl max-w-2xl"
                >
                  The premium recruiting platform connecting serious athletes with serious programs.
                  Chart your course to success with Helm Sports Labs.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/auth/signup"
                    className={cn(
                      helmGlass.buttonPrimary,
                      'inline-flex items-center gap-2 group'
                    )}
                  >
                    Start Your Journey
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="#demo"
                    className={cn(
                      helmGlass.buttonSecondary,
                      'inline-flex items-center gap-2'
                    )}
                  >
                    <Play className="w-4 h-4" />
                    Watch Demo
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-3 gap-8 pt-8"
              >
                {[
                  { value: '10,000+', label: 'Active Players', icon: '⚾' },
                  { value: '500+', label: 'College Programs', icon: '🎓' },
                  { value: '5,000+', label: 'Connections Made', icon: '🤝' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-h3 font-bold text-helm-green-500 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-body-sm text-helm-green-700 dark:text-helm-cream-300 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              {/* Glass Card with Dashboard Preview */}
              <div className={cn(helmGlass.hero, 'p-8 relative overflow-hidden')}>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-helm-green-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-helm-ocean-500/10 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10 space-y-6">
                  {/* Baseball Logo Preview */}
                  <div className="flex items-center justify-center p-8 bg-helm-cream-50/50 dark:bg-helm-green-900/30 rounded-2xl">
                    <Image
                      src="/baseball-helm-logo.png"
                      alt="Baseball Recruiting"
                      width={200}
                      height={200}
                      className="drop-shadow-2xl animate-pulse-slow"
                    />
                  </div>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: '🎯', label: 'Smart Matching' },
                      { icon: '📊', label: 'Live Stats' },
                      { icon: '💬', label: 'Direct Messaging' },
                      { icon: '📅', label: 'Event Calendar' },
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                        className={cn(
                          helmGlass.card,
                          'p-4 text-center'
                        )}
                      >
                        <div className="text-2xl mb-2">{feature.icon}</div>
                        <div className="text-body-sm font-semibold text-helm-green-700 dark:text-helm-cream-100">
                          {feature.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating accent elements */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-6 -right-6 w-24 h-24 bg-helm-green-500/20 rounded-full blur-2xl"
              />
              <motion.div
                animate={{
                  y: [0, 15, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-helm-ocean-500/20 rounded-full blur-2xl"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Navigation Header

```tsx
// components/layout/HelmNavbar.tsx

export function HelmNavbar() {
  return (
    <header className={helmGlass.navbar}>
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/helm-logo.png"
              alt="Helm Sports Labs"
              width={48}
              height={48}
              className="group-hover:scale-110 transition-transform duration-300"
            />
            <div className="hidden sm:block">
              <div className="text-h5 font-bold text-helm-green-800 dark:text-helm-cream-100">
                Helm Sports Labs
              </div>
              <div className="text-body-xs text-helm-green-600 dark:text-helm-cream-400 font-medium">
                Navigate Your Journey
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-body font-medium text-helm-green-700 dark:text-helm-cream-200 hover:text-helm-green-500 dark:hover:text-helm-cream-100 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#baseball"
              className="flex items-center gap-2 text-body font-medium text-helm-green-700 dark:text-helm-cream-200 hover:text-helm-green-500 dark:hover:text-helm-cream-100 transition-colors"
            >
              <Image src="/baseball-helm-logo.png" width={20} height={20} alt="" />
              Baseball
            </Link>
            <Link
              href="#golf"
              className="flex items-center gap-2 text-body font-medium text-helm-green-700 dark:text-helm-cream-200 hover:text-helm-green-500 dark:hover:text-helm-cream-100 transition-colors"
            >
              <Image src="/golf-helm-logo.png" width={20} height={20} alt="" />
              Golf
            </Link>
            <Link
              href="#testimonials"
              className="text-body font-medium text-helm-green-700 dark:text-helm-cream-200 hover:text-helm-green-500 dark:hover:text-helm-cream-100 transition-colors"
            >
              Testimonials
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-body font-semibold text-helm-green-700 dark:text-helm-cream-200 hover:text-helm-green-500 dark:hover:text-helm-cream-100 transition-colors px-4 py-2"
            >
              Log In
            </Link>
            <Link href="/auth/signup" className={helmGlass.buttonPrimary}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
```

### Features Section (Bento Grid)

```tsx
// components/landing/HelmFeaturesBento.tsx

export function HelmFeaturesBento() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(helmGlass.badge, 'inline-flex')}
          >
            Features
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="helm-heading-2"
          >
            Everything You Need to Succeed
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="helm-body-large max-w-2xl mx-auto"
          >
            Built for the modern athlete and recruiter. Every feature designed to make your recruiting journey smoother.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature cards with varying sizes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(helmGlass.cardInteractive, 'lg:col-span-2 lg:row-span-2 p-8')}
          >
            <div className="flex flex-col h-full">
              <div className={cn(helmGlass.badge, 'mb-4 w-fit')}>
                🎯 Smart Matching
              </div>
              <h3 className="helm-heading-3 mb-4">
                AI-Powered Recruiting
              </h3>
              <p className="helm-body text-body-lg mb-6 flex-grow">
                Our intelligent matching algorithm connects players with the right programs based on performance, academics, and fit.
              </p>
              {/* Visual element */}
              <div className={cn(helmGlass.card, 'p-6 bg-gradient-to-br from-helm-green-500/10 to-helm-ocean-500/10')}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-helm-green-500 flex items-center justify-center text-white text-2xl font-bold">
                    95%
                  </div>
                  <div>
                    <div className="text-body-sm font-semibold text-helm-green-700 dark:text-helm-cream-100">
                      Match Accuracy
                    </div>
                    <div className="text-body-xs text-helm-green-600 dark:text-helm-cream-400">
                      Based on player feedback
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* More feature cards... */}
          {[
            {
              icon: '📊',
              title: 'Live Stats Tracking',
              description: 'Real-time performance metrics that coaches trust',
            },
            {
              icon: '💬',
              title: 'Direct Messaging',
              description: 'Connect directly with coaches and programs',
            },
            {
              icon: '📅',
              title: 'Event Calendar',
              description: 'Never miss a showcase, camp, or game',
            },
            {
              icon: '🎥',
              title: 'Video Highlights',
              description: 'Showcase your best plays to recruiters',
            },
            {
              icon: '📈',
              title: 'Progress Tracking',
              description: 'Monitor your recruiting journey',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(helmGlass.cardInteractive, 'p-6')}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="helm-heading-4 text-h5 mb-2">{feature.title}</h4>
              <p className="helm-text-muted">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Dashboard Makeover

### Baseball Dashboard Header

```tsx
// app/(dashboard)/coach/college/layout.tsx

export default function BaseballDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-helm-cream-50 via-helm-cream-100 to-helm-green-50 dark:from-helm-green-950 dark:via-helm-green-900 dark:to-black">
      {/* Baseball Dashboard Header */}
      <header className={helmGlass.navbar}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Baseball Branding */}
            <div className="flex items-center gap-4">
              <Image
                src="/baseball-helm-logo.png"
                alt="Baseball Recruiting"
                width={48}
                height={48}
                className="drop-shadow-lg"
              />
              <div>
                <div className="text-h5 font-bold text-helm-green-800 dark:text-helm-cream-100">
                  Baseball Recruiting
                </div>
                <div className="text-body-xs text-helm-green-600 dark:text-helm-cream-400">
                  Helm Sports Labs
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/coach/college"
                className="text-body font-medium text-helm-green-700 dark:text-helm-cream-200 hover:text-helm-green-500 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/coach/college/watchlist"
                className="text-body font-medium text-helm-green-700 dark:text-helm-cream-200 hover:text-helm-green-500 transition-colors"
              >
                Watchlist
              </Link>
              <Link
                href="/coach/college/discover"
                className="text-body font-medium text-helm-green-700 dark:text-helm-cream-200 hover:text-helm-green-500 transition-colors"
              >
                Discover
              </Link>
              <Link
                href="/coach/college/messages"
                className="text-body font-medium text-helm-green-700 dark:text-helm-cream-200 hover:text-helm-green-500 transition-colors"
              >
                Messages
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Avatar className="w-10 h-10 ring-2 ring-helm-green-500/20">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
```

### Dashboard Stats Cards

```tsx
// components/dashboard/HelmStatCard.tsx

interface HelmStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
}

export function HelmStatCard({ icon, label, value, change, onClick }: HelmStatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        helmGlass.statCard,
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'p-3 rounded-2xl',
          'bg-helm-green-500/10 dark:bg-helm-green-400/10',
          'text-helm-green-600 dark:text-helm-green-400'
        )}>
          {icon}
        </div>
        {change && (
          <div className={cn(
            helmGlass.badge,
            'flex items-center gap-1',
            change.trend === 'up' && 'bg-green-500/10 text-green-700 dark:text-green-400',
            change.trend === 'down' && 'bg-red-500/10 text-red-700 dark:text-red-400',
            change.trend === 'neutral' && 'bg-helm-cream-100/50 text-helm-green-700'
          )}>
            {change.trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {change.trend === 'down' && <TrendingDown className="w-3 h-3" />}
            <span className="text-body-xs font-bold">{change.value}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-body-sm font-medium text-helm-green-600 dark:text-helm-cream-400 uppercase tracking-wide">
          {label}
        </div>
        <div className="text-h2 font-bold text-helm-green-900 dark:text-helm-cream-50">
          {value}
        </div>
      </div>
    </motion.div>
  );
}
```

### Dashboard Player Cards

```tsx
// components/dashboard/HelmPlayerCard.tsx

interface HelmPlayerCardProps {
  player: {
    id: string;
    name: string;
    position: string;
    gradYear: number;
    avatar: string | null;
    school: string;
    state: string;
    stats?: {
      avg?: number;
      era?: number;
      ops?: number;
    };
  };
  onView?: () => void;
  onMessage?: () => void;
  onAddToWatchlist?: () => void;
}

export function HelmPlayerCard({ player, onView, onMessage, onAddToWatchlist }: HelmPlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={helmGlass.cardInteractive}
    >
      <div className="p-6 space-y-4">
        {/* Player Header */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 ring-2 ring-helm-green-500/20">
            <AvatarImage src={player.avatar || undefined} />
            <AvatarFallback className="bg-helm-green-500 text-white font-bold">
              {player.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h4 className="helm-heading-4 text-h5 truncate">{player.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={helmGlass.badge}>
                {player.position}
              </Badge>
              <span className="text-body-sm text-helm-green-600 dark:text-helm-cream-400">
                Class of {player.gradYear}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onAddToWatchlist}
            className="hover:text-helm-green-500"
          >
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>

        {/* School Info */}
        <div className="flex items-center gap-2 text-body-sm text-helm-green-700 dark:text-helm-cream-300">
          <MapPin className="w-4 h-4" />
          <span>{player.school}, {player.state}</span>
        </div>

        {/* Stats */}
        {player.stats && (
          <div className={cn(helmGlass.card, 'p-4 grid grid-cols-3 gap-4')}>
            {Object.entries(player.stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-body-xs font-semibold text-helm-green-600 dark:text-helm-cream-400 uppercase">
                  {key}
                </div>
                <div className="text-h4 font-bold text-helm-green-800 dark:text-helm-cream-100">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onView}
            className={cn(helmGlass.buttonPrimary, 'flex-1')}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </Button>
          <Button
            onClick={onMessage}
            className={helmGlass.buttonSecondary}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
```

---

## Component Library

### Buttons

```tsx
// components/ui/helm-button.tsx

import { cva, type VariantProps } from 'class-variance-authority';

const helmButtonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helm-green-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: cn(helmGlass.buttonPrimary),
        secondary: cn(helmGlass.buttonSecondary),
        ghost: 'hover:bg-helm-cream-100 dark:hover:bg-helm-green-900/30',
        outline: cn(
          'border-2 border-helm-green-500 bg-transparent',
          'text-helm-green-700 dark:text-helm-cream-100',
          'hover:bg-helm-green-500 hover:text-white',
          'dark:hover:bg-helm-green-400 dark:hover:text-helm-green-950'
        ),
      },
      size: {
        sm: 'px-4 py-2 text-button-sm',
        md: 'px-6 py-3 text-button',
        lg: 'px-8 py-3.5 text-button-lg',
        icon: 'w-10 h-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface HelmButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof helmButtonVariants> {}

export function HelmButton({ variant, size, className, ...props }: HelmButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(helmButtonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### Input Fields

```tsx
// components/ui/helm-input.tsx

export function HelmInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        helmGlass.input,
        'w-full',
        className
      )}
      {...props}
    />
  );
}

export function HelmTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        helmGlass.input,
        'w-full min-h-[120px] resize-y',
        className
      )}
      {...props}
    />
  );
}
```

### Cards

```tsx
// components/ui/helm-card.tsx

export function HelmCard({ children, className, interactive = false, ...props }: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        interactive ? helmGlass.cardInteractive : helmGlass.card,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function HelmCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4 border-b border-helm-green-500/10', className)}>
      {children}
    </div>
  );
}

export function HelmCardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function HelmCardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4 border-t border-helm-green-500/10', className)}>
      {children}
    </div>
  );
}
```

---

## Implementation Checklist

### Phase 1: Foundation (2-3 hours)

- [ ] **Install new fonts**
  - [ ] Add Inter font to `app/layout.tsx`
  - [ ] Add JetBrains Mono for stats/code
  - [ ] Update `tailwind.config.ts` font family

- [ ] **Add new logos**
  - [ ] Save `helm-logo.png` to `/public`
  - [ ] Save `baseball-helm-logo.png` to `/public`
  - [ ] Save `golf-helm-logo.png` to `/public`
  - [ ] Optimize images (use Next.js Image optimization)

- [ ] **Update color system**
  - [ ] Create new color palette in `tailwind.config.ts`
  - [ ] Add helm.green shades (50-950)
  - [ ] Add helm.cream shades (50-900)
  - [ ] Add helm.ocean, helm.sand, helm.sunset accents
  - [ ] Test dark mode compatibility

- [ ] **Create glassmorphism library**
  - [ ] Create `lib/glassmorphism-helm.ts`
  - [ ] Export all glass component styles
  - [ ] Export glass background utilities
  - [ ] Test across light/dark modes

### Phase 2: Landing Page (4-6 hours)

- [ ] **Rebrand header**
  - [ ] Replace ScoutPulse logo with Helm logo
  - [ ] Update company name to "Helm Sports Labs"
  - [ ] Update tagline to "Navigate Your Recruiting Journey"
  - [ ] Apply new color scheme
  - [ ] Test mobile responsiveness

- [ ] **Redesign hero section**
  - [ ] Create `components/landing/HeroSectionHelm.tsx`
  - [ ] Implement new layout (2-column grid)
  - [ ] Add ship helm logo with proper sizing
  - [ ] Update headline copy
  - [ ] Style with new glass components
  - [ ] Add maritime theme animations
  - [ ] Test across devices

- [ ] **Update features section**
  - [ ] Create `components/landing/HelmFeaturesBento.tsx`
  - [ ] Apply new glass card styling
  - [ ] Update icon system
  - [ ] Improve typography hierarchy
  - [ ] Add micro-interactions

- [ ] **Redesign footer**
  - [ ] Apply new glass styling
  - [ ] Update branding elements
  - [ ] Ensure color consistency

### Phase 3: Authentication Pages (1-2 hours)

- [ ] **Update sign-in page**
  - [ ] Add baseball helm logo
  - [ ] Apply new glass styling
  - [ ] Update color scheme
  - [ ] Improve form design
  - [ ] Add "Baseball Recruiting" subtitle

- [ ] **Update sign-up page**
  - [ ] Add baseball helm logo
  - [ ] Apply new glass styling
  - [ ] Update role selection UI
  - [ ] Improve form layout

### Phase 4: Dashboard Redesign (6-8 hours)

- [ ] **Dashboard layout**
  - [ ] Create new dashboard header with baseball logo
  - [ ] Apply background gradients
  - [ ] Update navigation styling
  - [ ] Add glass effect to sidebar (if applicable)

- [ ] **Stat cards**
  - [ ] Create `components/dashboard/HelmStatCard.tsx`
  - [ ] Apply new glass styling
  - [ ] Improve number formatting
  - [ ] Add trend indicators
  - [ ] Add icon backgrounds

- [ ] **Player cards**
  - [ ] Create `components/dashboard/HelmPlayerCard.tsx`
  - [ ] Apply new glass styling
  - [ ] Improve avatar presentation
  - [ ] Update badge styling
  - [ ] Add smooth hover effects

- [ ] **Data tables**
  - [ ] Apply glass styling to table headers
  - [ ] Update row hover states
  - [ ] Improve pagination
  - [ ] Add loading skeletons with new colors

- [ ] **Forms & modals**
  - [ ] Update input field styling (glass inputs)
  - [ ] Apply glass modal backgrounds
  - [ ] Update button styles
  - [ ] Improve validation feedback

### Phase 5: Golf Section (1-2 hours)

- [ ] **Golf landing section**
  - [ ] Create placeholder section
  - [ ] Display golf helm logo
  - [ ] Add "Coming Soon" message
  - [ ] Apply consistent glass styling
  - [ ] Add sign-up for updates CTA

### Phase 6: Polish & Testing (2-3 hours)

- [ ] **Cross-browser testing**
  - [ ] Test in Chrome
  - [ ] Test in Safari
  - [ ] Test in Firefox
  - [ ] Test in Edge

- [ ] **Responsive testing**
  - [ ] Mobile (320px-480px)
  - [ ] Tablet (768px-1024px)
  - [ ] Desktop (1280px+)
  - [ ] Large screens (1920px+)

- [ ] **Dark mode verification**
  - [ ] Test all components in dark mode
  - [ ] Verify contrast ratios (WCAG AA)
  - [ ] Check glass effects work properly
  - [ ] Ensure readability

- [ ] **Performance optimization**
  - [ ] Optimize logo images
  - [ ] Check bundle size impact
  - [ ] Verify animations are smooth (60fps)
  - [ ] Test loading times

- [ ] **Accessibility**
  - [ ] Verify keyboard navigation
  - [ ] Test screen reader compatibility
  - [ ] Check color contrast
  - [ ] Add ARIA labels where needed

### Phase 7: Documentation (1 hour)

- [ ] **Update README**
  - [ ] Document new color system
  - [ ] Explain glass component usage
  - [ ] Add component examples

- [ ] **Create style guide**
  - [ ] Document typography scale
  - [ ] Show color palette
  - [ ] Provide component examples
  - [ ] Add do's and don'ts

---

## Quick Start Commands

```bash
# 1. Install new fonts (if not using Google Fonts CDN)
npm install @fontsource/inter @fontsource/jetbrains-mono

# 2. Save logo files
# Place helm-logo.png, baseball-helm-logo.png, golf-helm-logo.png in /public

# 3. Update Tailwind config
# Apply the new color system from this document to tailwind.config.ts

# 4. Create glassmorphism library
# Create lib/glassmorphism-helm.ts with the code from this document

# 5. Update landing page
# Replace components/landing/HeroSectionLight.tsx with HeroSectionHelm.tsx

# 6. Test
npm run dev
# Visit http://localhost:3000
```

---

## Visual Examples

### Before vs. After

**BEFORE (Current State)**:
- ❌ Generic "ScoutPulse" branding
- ❌ Emerald green (#00C27A) doesn't match logo
- ❌ Basic sans-serif font
- ❌ Flat white backgrounds
- ❌ Simple shadows
- ❌ No visual depth
- ❌ Dated UI patterns

**AFTER (Helm Sports Labs)**:
- ✅ Premium "Helm Sports Labs" maritime branding
- ✅ Authentic logo green (#1B7651) + cream secondary
- ✅ Modern Inter font with proper hierarchy
- ✅ Sophisticated frosted glass backgrounds
- ✅ Layered depth with blur and transparency
- ✅ 3D-like visual depth
- ✅ Ultra-modern UI patterns

---

## Design Principles

1. **Premium Maritime Identity**: Everything should evoke the feeling of navigating to success - like a ship's helm guides the way
2. **Glass-First**: Frosted glass everywhere for sophistication
3. **Color Authenticity**: Use the EXACT green from the logo (#1B7651)
4. **Cream Warmth**: Cream (#F5F1EA) adds warmth and approachability
5. **Generous Spacing**: Don't crowd elements - let them breathe
6. **Subtle Animations**: Smooth 60fps micro-interactions
7. **Perfect Typography**: Inter font with mathematical scale
8. **Depth Layering**: Multiple z-index layers with blur create depth
9. **Consistent Rounding**: Everything is rounded (16px-24px radius)
10. **Accessibility First**: Maintain WCAG AA contrast ratios

---

## Final Notes

This redesign transforms Helm Sports Labs from a basic recruiting platform into **the most modern, premium recruiting experience in sports**. The frosted glass design system combined with the maritime branding creates a unique, memorable identity that positions the platform as the industry leader.

Every element has been carefully considered:
- Colors extracted from actual logos
- Typography scale mathematically perfect
- Glass components tested in light/dark modes
- Components designed for reusability
- Accessibility built-in from the start

**Estimated Implementation Time**: 15-20 hours total
**Recommended Approach**: Implement in phases, starting with foundation and landing page
**Priority**: Phase 1 (Foundation) and Phase 2 (Landing Page) are highest impact

The result will be a recruiting platform that looks like it was designed by Apple's design team - clean, modern, sophisticated, and absolutely premium.
