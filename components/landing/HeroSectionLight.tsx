'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export function HeroSectionLight() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Baseball Stadium Background with Dramatic Lights */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/stadium-lights.jpg)' }}
      >
        {/* Gradient overlay - darker at top (to show lights), lighter in middle (for text), darker at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/30 backdrop-blur-[2px]" />
        
        {/* Subtle emerald tint overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-teal-900/10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Position content slightly right of center to avoid competing with bright lights on left */}
          <div className="text-center" style={{ marginLeft: 'auto', marginRight: 'auto', paddingLeft: '5%' }}>
            
            {/* Text Content - Slightly Right of Center */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm bg-white/5 border border-white/20 shadow-lg"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-white">Trusted by 10,000+ players nationwide</span>
              </motion.div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">Build your future with</span>
                <br />
                <span className="text-emerald-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  digital recruiting
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-white leading-relaxed max-w-3xl mx-auto font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                Carrying forward the mission of connecting talent with opportunity, ScoutPulse enables you and your athletes to make your recruiting journey smoother and faster. We are definitely your go-to recruiting platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 group"
                >
                  <Link href="/auth/signup" className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="backdrop-blur-sm bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 shadow-lg transition-all duration-300"
                >
                  <Link href="#demo" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-8 pt-8 justify-center"
              >
                {[
                  { value: '10,000+', label: 'Active Players' },
                  { value: '500+', label: 'College Programs' },
                  { value: '5,000+', label: 'Connections Made' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

    </div>
  );
}

