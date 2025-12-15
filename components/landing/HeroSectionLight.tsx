'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import {
  glassCardPremium,
  glassPanel as glassPanelEnhanced,
  glassButton as glassButtonEnhanced,
  glassDarkZone as glassDarkZoneEnhanced,
} from '@/lib/glassmorphism-enhanced';
import { cn } from '@/lib/utils';

export function HeroSectionLight() {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center">
      {/* Baseball Stadium Background with Dramatic Lights */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{backgroundImage: 'url(/stadium-lights.jpg)' }}
      >
        {/* Stronger gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60"></div>
        {/* Emerald accent gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-teal-900/20"></div>
      </div>

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 container mx-auto px-6 py-20"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-10">

            {/* Premium Glass Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center"
            >
              <div className={cn(
                "inline-flex items-center gap-2.5 px-6 py-3 rounded-full backdrop-blur-xl",
                "bg-white/10 border border-white/20",
                "shadow-2xl shadow-emerald-500/20"
              )}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="text-sm font-medium text-white/90">Trusted by 10,000+ players nationwide</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.1]">
                <span className="block text-white drop-shadow-2xl mb-2">
                  The Future of
                </span>
                <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-2xl">
                  Baseball Analytics
                </span>
              </h1>
            </motion.div>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto font-medium"
            >
              Advanced metrics, real-time scouting, and data-driven insights to elevate your game
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "px-8 py-6 text-base sm:text-lg font-semibold rounded-xl",
                    "bg-gradient-to-r from-emerald-500 to-teal-600",
                    "hover:from-emerald-600 hover:to-teal-700",
                    "text-white shadow-2xl shadow-emerald-500/50",
                    "border border-white/20",
                    "transition-all duration-300 group"
                  )}
                  aria-label="Get started with Helm Sports Labs"
                >
                  <Link href="/auth/signup" className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} aria-hidden="true" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    "px-8 py-6 text-base sm:text-lg font-semibold rounded-xl",
                    "backdrop-blur-xl bg-white/10 border-2 border-white/30 text-white",
                    "hover:bg-white/20 hover:border-white/40",
                    "shadow-xl shadow-white/10 hover:shadow-2xl hover:shadow-white/20",
                    "transition-all duration-300"
                  )}
                  aria-label="Watch demo video"
                >
                  <Link href="#demo" className="flex items-center gap-2">
                    <Play className="w-5 h-5 fill-white" strokeWidth={2} aria-hidden="true" />
                    Watch Demo
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="pt-12"
              role="region"
              aria-label="Platform statistics"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  { value: '10,000+', label: 'Active Players' },
                  { value: '500+', label: 'College Programs' },
                  { value: '5,000+', label: 'Connections Made' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + (i * 0.1) }}
                    className={cn(
                      "relative group p-8 rounded-2xl",
                      "backdrop-blur-xl bg-white/5 border border-white/10",
                      "hover:bg-white/10 hover:border-white/20",
                      "shadow-xl hover:shadow-2xl",
                      "transition-all duration-300"
                    )}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-br from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-white/80">
                        {stat.label}
                      </div>
                    </div>
                    {/* Decorative glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
