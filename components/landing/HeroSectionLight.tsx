'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
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
        {/* Blur effect on background */}
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        {/* Stronger gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/70"></div>
        {/* Helm green accent gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#16893B]/20 via-transparent to-[#0F5A28]/20"></div>
      </div>

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 sm:space-y-10">

            {/* Premium Glass Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center pt-4"
            >
              <div className={cn(
                "inline-flex items-center gap-2.5 px-6 py-3 rounded-full backdrop-blur-xl",
                "bg-[#16893B]/20 border border-[#16893B]/40",
                "shadow-2xl shadow-[#16893B]/30"
              )}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8F8D0] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16893B]"></span>
                </span>
                <span className="text-sm font-semibold text-white">Trusted by 10,000+ players nationwide</span>
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
                <span className="block bg-gradient-to-r from-[#B8F8D0] via-[#16893B] to-[#0F5A28] bg-clip-text text-transparent drop-shadow-2xl">
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
                    "bg-gradient-to-r from-[#16893B] to-[#0F5A28]",
                    "hover:from-[#0F5A28] hover:to-[#0A3D1A]",
                    "text-white shadow-2xl shadow-[#16893B]/50",
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
                    "backdrop-blur-xl bg-white/20 border-2 border-white/40 text-white",
                    "hover:bg-white/30 hover:border-white/50",
                    "shadow-xl shadow-white/20 hover:shadow-2xl hover:shadow-white/30",
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
              className="pt-12 px-4"
              role="region"
              aria-label="Platform statistics"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                      "relative group p-6 sm:p-8 rounded-2xl",
                      "backdrop-blur-xl bg-slate-900/40 border border-[#16893B]/20",
                      "hover:bg-slate-900/50 hover:border-[#16893B]/40",
                      "shadow-2xl hover:shadow-[#16893B]/20",
                      "transition-all duration-300"
                    )}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-br from-[#B8F8D0] via-[#16893B] to-[#0F5A28] bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-white">
                        {stat.label}
                      </div>
                    </div>
                    {/* Decorative glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#16893B]/0 to-[#0F5A28]/0 group-hover:from-[#16893B]/10 group-hover:to-[#0F5A28]/10 transition-all duration-300" />
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

