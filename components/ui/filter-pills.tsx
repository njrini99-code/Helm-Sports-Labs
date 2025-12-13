'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';

interface FilterPill {
  id: string;
  label: string;
  value?: string;
}

interface FilterPillsProps {
  filters: FilterPill[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterPills({
  filters,
  onRemove,
  onClearAll,
  className,
}: FilterPillsProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onRemove(filter.id)}
          className="group inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <span>{filter.label}</span>
          {filter.value && (
            <span className="text-primary/70">: {filter.value}</span>
)}
          <X className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>
)}
      {filters.length > 1 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
)}
    </div>
  );
}

// Simple toggle filter pills
interface TogglePillsProps {
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
  className?: string;
}

export function TogglePills({
  options,
  selected,
  onChange,
  multiple = true,
  className,
}: TogglePillsProps) {
  const handleToggle = (id: string) => {
    if (multiple) {
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else {
        onChange([...selected, id]);
      }
    } else {
      onChange(selected.includes(id) ? [] : [id]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <button
            key={option.id}
            onClick={() => handleToggle(option.id)}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

