'use client';

import { motion } from 'framer-motion';

export function SectionDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"></div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/20 to-transparent blur-sm"></div>
    </div>
  );
}
