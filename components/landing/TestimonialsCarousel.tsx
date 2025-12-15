'use client';

import { motion } from 'framer-motion';
import { glassCard } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Helm Sports Labs completely transformed how we recruit. The video analysis tools are incredible and save us hours every week.",
    name: "Coach Martinez",
    role: "Head Coach, State University"
  },
  {
    quote: "I got recruited by my dream school thanks to Helm Sports Labs. The platform made it so easy to showcase my skills.",
    name: "Alex Johnson",
    role: "Pitcher, Class of 2024"
  },
  {
    quote: "The best recruiting platform we've used. The player profiles are comprehensive and the messaging system is seamless.",
    name: "Coach Williams",
    role: "Recruiting Coordinator, Big State"
  },
  {
    quote: "As a JUCO player, finding the right fit was tough. Helm Sports Labs connected me with programs that actually wanted me.",
    name: "Marcus Davis",
    role: "Outfielder, Transfer Portal"
  },
  {
    quote: "The stats tracking feature is a game-changer. We can see player progression over time and make data-driven decisions.",
    name: "Coach Anderson",
    role: "Assistant Coach, Regional College"
  },
  {
    quote: "I love how easy it is to upload videos and organize my highlights. Coaches can find exactly what they're looking for.",
    name: "Jordan Smith",
    role: "Catcher, High School Senior"
  }
];

// Duplicate testimonials for seamless infinite scroll
const duplicatedTestimonials = [...testimonials, ...testimonials];

export function TestimonialsCarousel() {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-helm-cream-50 to-helm-cream-100 dark:from-helm-green-950 dark:to-helm-green-900">
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{duration: 0.3 }}
  className="relative container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-helm-gray-950 dark:text-helm-cream-100 mb-6"
          >
            Trusted by <span className="bg-gradient-to-r from-helm-green-500 to-helm-green-600 text-transparent bg-clip-text">Thousands</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-helm-gray-600 dark:text-helm-cream-200"
          >
            See what players and coaches are saying
          </motion.p>
        </div>
      {/* Infinite scroll testimonials */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-helm-cream-50 dark:from-helm-green-950 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-helm-cream-50 dark:from-helm-green-950 to-transparent z-10 pointer-events-none"></div>
      <div className="flex gap-6 animate-scroll">
            {duplicatedTestimonials.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            duplicatedTestimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className={cn(glassCard, "flex-shrink-0 w-96 p-8 transition-all duration-300")}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-helm-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-helm-gray-700 dark:text-helm-cream-200 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-helm-green-400 to-helm-green-500 shadow-lg"></div>
                  <div>
                    <div className="font-semibold text-helm-gray-950 dark:text-helm-cream-100">{testimonial.name}</div>
                    <div className="text-sm text-helm-gray-600 dark:text-helm-cream-300">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
