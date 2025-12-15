'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { glassHero } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

export function FinalCTASection() {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-helm-green-950 via-helm-green-900 to-helm-green-950">
      {/* Particle background */}
      <div className="absolute inset-0">
        {/* Animated particles using CSS */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-helm-green-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}></div>
        ))}
      </div>
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{duration: 0.3 }}
  className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={cn(glassHero, "max-w-4xl mx-auto")}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl lg:text-7xl font-black text-helm-cream-50 mb-8 tracking-tight leading-tight"
          >
            Ready to Transform Your{' '}
            <span className="bg-gradient-to-r from-helm-green-300 via-helm-green-400 to-helm-green-300 text-transparent bg-clip-text bg-[length:200%_auto] animate-gradient">
              Recruiting
            </span>
            ?
          </motion.h2>
      <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{delay: 0.1 }}
            className="text-xl md:text-2xl text-helm-cream-100/90 max-w-2xl mx-auto mb-16 font-medium leading-relaxed"
          >
            Join the elite programs using data-driven insights to find and develop tomorrow's stars
          </motion.p>
      <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{delay: 0.2 }}
          >
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-helm-green-500 to-helm-green-600 text-white text-lg font-semibold rounded-xl shadow-2xl shadow-helm-green-500/30 hover:shadow-helm-green-500/40 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              <span>Start Your Journey</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
      <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{delay: 0.3 }}
            className="text-sm text-helm-cream-300 mt-6"
          >
            No credit card required • Get started in under 2 minutes
          </motion.p>
        </motion.div>
      </motion.div>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
      `}</style>
    </section>
  );
}
