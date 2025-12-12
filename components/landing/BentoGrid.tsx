'use client';

import { motion } from 'framer-motion';
import { Video, BarChart3, MessageSquare, Users, Network, User, Target, Zap } from 'lucide-react';
import { Card3D } from './Card3D';
import { cn } from '@/lib/utils';

export function BentoGrid() {
  return (
    <section className="relative py-32 bg-gradient-to-b from-white to-slate-50/50">
      <motion.div
  initial={ opacity: 0, y: 20 }
  animate={ opacity: 1, y: 0 }
  transition={{duration: 0.3 }}
  className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.div
            initial={ opacity: 0, y: 20 }
            whileInView={ opacity: 1, y: 0 }
            viewport={ once: true }
            className="inline-block px-4 py-2 rounded-full backdrop-blur-xl bg-emerald-50 border border-emerald-200/50 text-emerald-600 text-sm font-medium mb-4 shadow-sm"
          >
            Everything You Need
          </motion.div>
      <motion.h2
            initial={ opacity: 0, y: 20 }
            whileInView={ opacity: 1, y: 0 }
            viewport={ once: true }
            transition={{delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-slate-900 mb-6"
          >
            Built for <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text">Success</span>
          </motion.h2>
      <motion.p
            initial={ opacity: 0, y: 20 }
            whileInView={ opacity: 1, y: 0 }
            viewport={ once: true }
            transition={{delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto"
          >
            Everything you need to get recruited, in one beautiful platform
          </motion.p>
        </div>
      {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-auto">
          
          {/* Large feature card - Video Highlights */}
          <Card3D intensity={10} className="col-span-1 md:col-span-6 lg:col-span-8 row-span-2">
            <motion.div
              initial={ opacity: 0, y: 20 }
              whileInView={ opacity: 1, y: 0 }
              viewport={ once: true }
              className="group relative rounded-3xl backdrop-blur-2xl bg-white/70 border border-emerald-200/50 p-8 md:p-12 overflow-hidden hover:border-emerald-400/60 transition-all duration-500 shadow-xl shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
            {/* Animated gradient orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className={cn(
                "inline-flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-lg",
                "bg-gradient-to-br from-emerald-500/25 to-teal-500/20",
                "border border-emerald-400/30 shadow-lg shadow-emerald-500/20 mb-6"
              )}>
                <Video className="w-6 h-6 text-emerald-300" strokeWidth={2} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Video Highlights</h3>
              <p className="text-lg text-slate-600 mb-8">
                Upload, organize, and share your best plays. AI-powered tagging makes it easy for coaches to find exactly what they're looking for.
              </p>
              {/* Mock screenshot */}
              <div className="rounded-2xl overflow-hidden border border-emerald-200/30 shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-xl border border-emerald-200/50 flex items-center justify-center shadow-lg">
                    <Video className="w-7 h-7 text-emerald-600" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </Card3D>
      {/* Medium feature card - Stats Tracking */}
          <Card3D intensity={8} className="col-span-1 md:col-span-3 lg:col-span-4">
            <motion.div
              initial={ opacity: 0, y: 20 }
              whileInView={ opacity: 1, y: 0 }
              viewport={ once: true }
              transition={{delay: 0.1 }}
              className="group relative rounded-3xl backdrop-blur-2xl bg-white/60 border border-emerald-200/40 p-8 overflow-hidden hover:border-teal-400/60 transition-all duration-500 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-teal-500/10"
            >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className={cn(
                "inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-lg",
                "bg-gradient-to-br from-teal-500/25 to-cyan-500/20",
                "border border-teal-400/30 shadow-lg shadow-teal-500/20 mb-4"
              )}>
                <BarChart3 className="w-5 h-5 text-teal-300" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Stats Tracking</h3>
              <p className="text-slate-600">
                Track your progress with detailed analytics and performance metrics
              </p>
            </div>
            </motion.div>
          </Card3D>
      {/* Small feature card - Direct Messaging */}
          <Card3D intensity={8} className="col-span-1 md:col-span-3 lg:col-span-4">
            <motion.div
              initial={ opacity: 0, y: 20 }
              whileInView={ opacity: 1, y: 0 }
              viewport={ once: true }
              transition={{delay: 0.15 }}
              className="group relative rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 overflow-hidden hover:border-cyan-500/30 transition-all duration-500 shadow-xl shadow-black/20 hover:shadow-cyan-500/10"
            >
              <div className="relative z-10">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-lg",
                  "bg-gradient-to-br from-cyan-500/25 to-blue-500/20",
                  "border border-cyan-400/30 shadow-lg shadow-cyan-500/20 mb-4"
                )}>
                  <MessageSquare className="w-5 h-5 text-cyan-300" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Direct Messaging</h3>
                <p className="text-slate-600">
                  Real-time communication with coaches and players
                </p>
              </div>
            </motion.div>
          </Card3D>
      {/* Medium feature card - Player Profiles */}
          <Card3D intensity={8} className="col-span-1 md:col-span-3 lg:col-span-4">
            <motion.div
              initial={ opacity: 0, y: 20 }
              whileInView={ opacity: 1, y: 0 }
              viewport={ once: true }
              transition={{delay: 0.2 }}
              className="group relative rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 overflow-hidden hover:border-purple-500/30 transition-all duration-500 shadow-xl shadow-black/20 hover:shadow-purple-500/10"
            >
              <div className="relative z-10">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-lg",
                  "bg-gradient-to-br from-purple-500/25 to-pink-500/20",
                  "border border-purple-400/30 shadow-lg shadow-purple-500/20 mb-4"
                )}>
                  <User className="w-5 h-5 text-purple-300" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Player Profiles</h3>
                <p className="text-slate-600">
                  Comprehensive athlete portfolios showcasing talent
                </p>
              </div>
            </motion.div>
          </Card3D>
      {/* Small feature card - Smart Matching */}
          <Card3D intensity={8} className="col-span-1 md:col-span-3 lg:col-span-4">
            <motion.div
              initial={ opacity: 0, y: 20 }
              whileInView={ opacity: 1, y: 0 }
              viewport={ once: true }
              transition={{delay: 0.25 }}
              className="group relative rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 overflow-hidden hover:border-orange-500/30 transition-all duration-500 shadow-xl shadow-black/20 hover:shadow-orange-500/10"
            >
              <div className="relative z-10">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-lg",
                  "bg-gradient-to-br from-orange-500/25 to-red-500/20",
                  "border border-orange-400/30 shadow-lg shadow-orange-500/20 mb-4"
                )}>
                  <Target className="w-5 h-5 text-orange-300" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Smart Matching</h3>
                <p className="text-slate-600">
                  AI-powered recommendations for perfect fits
                </p>
              </div>
            </motion.div>
          </Card3D>
      {/* Large feature card - College Network */}
          <Card3D intensity={10} className="col-span-1 md:col-span-6 lg:col-span-8 row-span-2">
            <motion.div
              initial={ opacity: 0, y: 20 }
              whileInView={ opacity: 1, y: 0 }
              viewport={ once: true }
              transition={{delay: 0.3 }}
              className="group relative rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 md:p-12 overflow-hidden hover:border-teal-500/30 transition-all duration-500"
            >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className={cn(
                "inline-flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-lg",
                "bg-gradient-to-br from-teal-500/25 to-cyan-500/20",
                "border border-teal-400/30 shadow-lg shadow-teal-500/20 mb-6"
              )}>
                <Network className="w-6 h-6 text-teal-300" strokeWidth={2} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">College Network</h3>
              <p className="text-lg text-slate-600 mb-8">
                Connect with 500+ college programs nationwide. Build relationships that matter.
              </p>
              {/* Network visualization */}
              <div className="relative h-48 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-200/30 p-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Central node */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-teal-500 border-2 border-white/30 shadow-lg">
                      <div className="absolute inset-0 rounded-full bg-teal-500/50 animate-ping"></div>
                    </div>
                    {/* Connected nodes */}
                    {[
                      { top: '10%', left: '20%' },
                      { top: '20%', right: '15%' },
                      { bottom: '15%', left: '25%' },
                      { bottom: '25%', right: '20%' },
                    ].map((pos, i) => (
                      <div key={i} className="absolute" style={{pos}}>
                        <div className="w-8 h-8 rounded-full bg-emerald-400/60 border border-white/20"></div>
                      </div>
)}
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          </Card3D>
      {/* Small feature card - Fast Performance */}
          <Card3D intensity={8} className="col-span-1 md:col-span-3 lg:col-span-4">
            <motion.div
              initial={ opacity: 0, y: 20 }
              whileInView={ opacity: 1, y: 0 }
              viewport={ once: true }
              transition={{delay: 0.35 }}
              className="group relative rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 overflow-hidden hover:border-indigo-500/30 transition-all duration-500 shadow-xl shadow-black/20 hover:shadow-indigo-500/10"
            >
              <div className="relative z-10">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-lg",
                  "bg-gradient-to-br from-indigo-500/25 to-blue-500/20",
                  "border border-indigo-400/30 shadow-lg shadow-indigo-500/20 mb-4"
                )}>
                  <Zap className="w-5 h-5 text-indigo-300" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
                <p className="text-slate-600">
                  Built for speed. Instant search and seamless experience.
                </p>
              </div>
            </motion.div>
          </Card3D>
        </div>
      </motion.div>
    </section>
  );
}
