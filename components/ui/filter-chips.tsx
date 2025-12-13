'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterChip {
  id: string;
  label: string;
  value: string;
  category?: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
  maxVisible?: number;
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className,
  maxVisible,
}: FilterChipsProps) {
  const visibleFilters = maxVisible
    ? filters.slice(0, maxVisible)
    : filters;
  const hiddenCount = maxVisible ? filters.length - maxVisible : 0;

  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <AnimatePresence mode="popLayout">
        {visibleFilters.map((filter) => (
          <motion.div
            key={filter.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{duration: 0.2 }}
          >
            <Button
              variant="secondary"
              size="sm"
              className="h-8 rounded-full px-3 pr-2 gap-2"
              onClick={() => onRemove(filter.id)}
            >
              <span className="text-sm">
                {filter.category && (
                  <span className="text-muted-foreground">{filter.category}: </span>
)}
                {filter.label}
              </span>
              <X className="h-3 w-3" />
            </Button>
          </motion.div>
)}
      </AnimatePresence>
      {hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-sm text-muted-foreground"
        >
          +{hiddenCount} more
        </Button>
)}
      {onClearAll && filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-sm text-muted-foreground hover:text-foreground"
          onClick={onClearAll}
        >
          Clear all
        </Button>
)}
    </div>
  );
}
