'use client';

import { motion } from 'framer-motion';
import { Video, BarChart3, MessageSquare, Users, Network, User, Target, Zap } from 'lucide-react';
import { Card3D } from './Card3D';
import { cn } from '@/lib/utils';
import { glassCard } from '@/lib/glassmorphism';

export function BentoGrid() {
  return (
    <section className="relative py-32 bg-gradient-to-b from-helm-cream-50 to-helm-cream-100/50 dark:from-helm-gray-950 dark:to-helm-gray-900">
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{duration: 0.3 }}
  className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-helm-gray-950 dark:text-helm-cream-50 mb-8 tracking-tight"
          >
            Built for <span className="bg-gradient-to-r from-helm-green-500 to-helm-green-400 text-transparent bg-clip-text">Success</span>
          </motion.h2>
      <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{delay: 0.2 }}
            className="text-xl md:text-2xl text-helm-gray-600 dark:text-helm-cream-200/70 max-w-3xl mx-auto font-medium"
          >
            Everything you need to make data-driven recruiting decisions
          </motion.p>
        </div>
      {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-auto">
          
          {/* Large feature card - Video Highlights */}
          <Card3D intensity={10} className="col-span-1 md:col-span-6 lg:col-span-8 row-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                glassCard,
                "group relative rounded-3xl overflow-hidden",
                "p-10 md:p-14",
                "hover:shadow-[0_8px_48px_rgba(74,155,107,0.2)]",
                "hover:-translate-y-2 hover:scale-[1.02]",
                "transition-all duration-500"
              )}
            >
            {/* Animated gradient orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-helm-green-500/20 to-helm-green-600/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className={cn(
                "inline-flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-lg",
                "bg-helm-green-500/20",
                "border border-helm-green-400/30 shadow-lg shadow-helm-green-500/20 mb-6"
              )}>
                <Video className="w-6 h-6 text-helm-green-300" strokeWidth={2} />
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-helm-gray-900 dark:text-helm-cream-50 mb-4 tracking-tight">Video Highlights</h3>
              <p className="text-lg text-helm-gray-600 dark:text-helm-cream-200 mb-8">
                Upload, organize, and share your best plays. AI-powered tagging makes it easy for coaches to find exactly what they're looking for.
              </p>
              {/* Mock screenshot */}
              <div className="rounded-2xl overflow-hidden border border-helm-green-200/30 shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-helm-green-50 to-helm-green-100 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-xl border border-helm-green-200/50 flex items-center justify-center shadow-lg">
                    <Video className="w-7 h-7 text-helm-green-600" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </Card3D>
      {/* Medium feature card - Stats Tracking */}
          <Card3D intensity={8} className="col-span-1 md:col-span-3 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{delay: 0.1 }}
              className={cn(
                glassCard,
                "group relative rounded-3xl overflow-hidden",
                "p-10",
                "hover:shadow-[0_8px_48px_rgba(74,155,107,0.2)]",
                "hover:-translate-y-2 hover:scale-[1.02]",
                "transition-all duration-500"
              )}
            >
            <div className="absolute inset-0 bg-gradient-to-br from-helm-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className={cn(
                "inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-lg",
                "bg-helm-green-500/20",
                "border border-helm-green-400/30 shadow-lg shadow-helm-green-500/20 mb-4"
              )}>
                <BarChart3 className="w-5 h-5 text-helm-green-300" strokeWidth={2} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-helm-gray-900 dark:text-helm-cream-50 mb-3 tracking-tight">Stats Tracking</h3>
              <p className="text-helm-gray-600 dark:text-helm-cream-200">
                Track your progress with detailed analytics and performance metrics
              </p>
            </div>
            </motion.div>
          </Card3D>
      {/* Small feature card - Direct Messaging */}
          <Card3D intensity={8} className="col-span-1 md:col-span-3 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{delay: 0.15 }}
              className={cn(
                glassCard,
                "group relative rounded-3xl overflow-hidden",
                "p-10",
                "hover:shadow-[0_8px_48px_rgba(74,155,107,0.2)]",
                "hover:-translate-y-2 hover:scale-[1.02]",
                "transition-all duration-500"
              )}
            >
              <div className="relative z-10">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-lg",
                  "bg-helm-green-500/20",
                  "border border-helm-green-400/30 shadow-lg shadow-helm-green-500/20 mb-4"
                )}>
                  <MessageSquare className="w-5 h-5 text-helm-green-300" strokeWidth={2} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-helm-gray-900 dark:text-helm-cream-50 mb-3 tracking-tight">Direct Messaging</h3>
                <p className="text-helm-gray-600 dark:text-helm-cream-200">
                  Real-time communication with coaches and players
                </p>
              </div>
            </motion.div>
          </Card3D>
      {/* Medium feature card - Player Profiles */}
          <Card3D intensity={8} className="col-span-1 md:col-span-3 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{delay: 0.2 }}
              className={cn(
                glassCard,
                "group relative rounded-3xl overflow-hidden",
                "p-10",
                "hover:shadow-[0_8px_48px_rgba(74,155,107,0.2)]",
                "hover:-translate-y-2 hover:scale-[1.02]",
                "transition-all duration-500"
              )}
            >
              <div className="relative z-10">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-lg",
                  "bg-helm-green-500/20",
                  "border border-helm-green-400/30 shadow-lg shadow-helm-green-500/20 mb-4"
                )}>
                  <User className="w-5 h-5 text-helm-green-300" strokeWidth={2} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-helm-gray-900 dark:text-helm-cream-50 mb-3 tracking-tight">Player Profiles</h3>
                <p className="text-helm-gray-600 dark:text-helm-cream-200">
                  Comprehensive athlete portfolios showcasing talent
                </p>
              </div>
            </motion.div>
          </Card3D>
      {/* Small feature card - Smart Matching */}
          <Card3D intensity={8} className="col-span-1 md:col-span-3 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{delay: 0.25 }}
              className={cn(
                glassCard,
                "group relative rounded-3xl overflow-hidden",
                "p-10",
                "hover:shadow-[0_8px_48px_rgba(74,155,107,0.2)]",
                "hover:-translate-y-2 hover:scale-[1.02]",
                "transition-all duration-500"
              )}
            >
              <div className="relative z-10">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-lg",
                  "bg-helm-green-500/20",
                  "border border-helm-green-400/30 shadow-lg shadow-helm-green-500/20 mb-4"
                )}>
                  <Target className="w-5 h-5 text-helm-green-300" strokeWidth={2} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-helm-gray-900 dark:text-helm-cream-50 mb-3 tracking-tight">Smart Matching</h3>
                <p className="text-helm-gray-600 dark:text-helm-cream-200">
                  AI-powered recommendations for perfect fits
                </p>
              </div>
            </motion.div>
          </Card3D>
      {/* Large feature card - College Network */}
          <Card3D intensity={10} className="col-span-1 md:col-span-6 lg:col-span-8 row-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{delay: 0.3 }}
              className={cn(
                glassCard,
                "group relative rounded-3xl overflow-hidden",
                "p-10 md:p-14",
                "hover:shadow-[0_8px_48px_rgba(74,155,107,0.2)]",
                "hover:-translate-y-2 hover:scale-[1.02]",
                "transition-all duration-500"
              )}
            >
            <div className="absolute inset-0 bg-gradient-to-br from-helm-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className={cn(
                "inline-flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-lg",
                "bg-helm-green-500/20",
                "border border-helm-green-400/30 shadow-lg shadow-helm-green-500/20 mb-6"
              )}>
                <Network className="w-6 h-6 text-helm-green-300" strokeWidth={2} />
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-helm-gray-900 dark:text-helm-cream-50 mb-4 tracking-tight">College Network</h3>
              <p className="text-lg text-helm-gray-600 dark:text-helm-cream-200 mb-8">
                Connect with 500+ college programs nationwide. Build relationships that matter.
              </p>
              {/* Network visualization */}
              <div className="relative h-48 rounded-2xl bg-gradient-to-br from-helm-green-50/50 to-helm-green-100/50 border border-helm-green-200/30 p-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Central node */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-helm-green-500 border-2 border-white/30 shadow-lg">
                      <div className="absolute inset-0 rounded-full bg-helm-green-500/50 animate-ping"></div>
                    </div>
                    {/* Connected nodes */}
                    {[
                      { top: '10%', left: '20%' },
                      { top: '20%', right: '15%' },
                      { bottom: '15%', left: '25%' },
                      { bottom: '25%', right: '20%' },
                    ].map((pos, i) => (
                      <div key={i} className="absolute" style={pos}>
                        <div className="w-8 h-8 rounded-full bg-helm-green-400/60 border border-white/20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          </Card3D>
      {/* Small feature card - Fast Performance */}
          <Card3D intensity={8} className="col-span-1 md:col-span-3 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{delay: 0.35 }}
              className={cn(
                glassCard,
                "group relative rounded-3xl overflow-hidden",
                "p-10",
                "hover:shadow-[0_8px_48px_rgba(74,155,107,0.2)]",
                "hover:-translate-y-2 hover:scale-[1.02]",
                "transition-all duration-500"
              )}
            >
              <div className="relative z-10">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-lg",
                  "bg-helm-green-500/20",
                  "border border-helm-green-400/30 shadow-lg shadow-helm-green-500/20 mb-4"
                )}>
                  <Zap className="w-5 h-5 text-helm-green-300" strokeWidth={2} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-helm-gray-900 dark:text-helm-cream-50 mb-3 tracking-tight">Lightning Fast</h3>
                <p className="text-helm-gray-600 dark:text-helm-cream-200">
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
