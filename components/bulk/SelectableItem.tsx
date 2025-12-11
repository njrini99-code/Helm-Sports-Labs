'use client';

import { CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectableItemProps {
  id: string;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SelectableItem({
  id,
  isSelected,
  onSelect,
  children,
  className,
  disabled = false,
}: SelectableItemProps) {
  const handleClick = () => {
    if (!disabled) {
      onSelect(id, !isSelected);
    }
  };

  return (
    <div
      className={cn(
        'relative group',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'absolute left-2 top-2 z-10 p-1 rounded-md transition-all',
          'bg-white/90 backdrop-blur-sm border border-slate-200',
          'hover:bg-white hover:border-emerald-300',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
          isSelected && 'bg-emerald-50 border-emerald-400',
          disabled && 'cursor-not-allowed'
        )}
        aria-label={isSelected ? 'Deselect' : 'Select'}
      >
        {isSelected ? (
          <CheckSquare className="w-4 h-4 text-emerald-600" />
        ) : (
          <Square className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {children}
    </div>
  );
}

