'use client';

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import { glassDropdown } from '@/lib/glassmorphism';

// ═══════════════════════════════════════════════════════════════════════════
// GlassDropdown - Custom dropdown menu
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassDropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface GlassDropdownProps {
  /** Trigger element or render function */
  trigger: ReactNode | ((isOpen: boolean) => ReactNode);
  /** Dropdown items */
  items: GlassDropdownItem[];
  /** Called when an item is selected */
  onSelect: (itemId: string) => void;
  /** Alignment of the dropdown */
  align?: 'left' | 'right';
  /** Additional class name for the dropdown */
  className?: string;
  /** Disable the dropdown */
  disabled?: boolean;
}

export function GlassDropdown({
  trigger,
  items,
  onSelect,
  align = 'left',
  className,
  disabled = false,
}: GlassDropdownProps) {
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: align === 'right' ? rect.right : rect.left,
      });
    }
  }, [align]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      updatePosition();
    }
  };

  const handleSelect = (itemId: string) => {
    onSelect(itemId);
    setIsOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Update position on scroll/resize
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className={cn(
        'fixed z-50 min-w-[180px] py-1.5 animate-in fade-in zoom-in-95 duration-150',
        glassDropdown,
        className
      )}
      style={{top: position.top,
        left: align === 'right' ? 'auto' : position.left,
        right: align === 'right' ? window.innerWidth - position.left : 'auto',
      }}
    >
      {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            items.map((item, index) => {
        if (item.divider) {
          return (
            <div
              key={`divider-${index}`}
              className="my-1.5 border-t border-white/10"></div>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => !item.disabled && handleSelect(item.id)}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
              item.disabled
                ? 'text-white/30 cursor-not-allowed'
                : item.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-white/90 hover:bg-white/10'
            )}
          >
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            {item.label}
          </button>
        );
      })
      }
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(disabled && 'opacity-50 cursor-not-allowed')}
      >
        {typeof trigger === 'function' ? trigger(isOpen) : trigger}
      </button>
      {typeof document !== 'undefined' &&
        createPortal(dropdownContent, document.body)}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GlassSelectDropdown - Select-style dropdown with glass styling
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassSelectDropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface GlassSelectDropdownProps {
  /** Options for the select */
  options: GlassSelectDropdownOption[];
  /** Currently selected value */
  value?: string;
  /** Called when selection changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class name */
  className?: string;
}

const selectSizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
};

export function GlassSelectDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  disabled = false,
  fullWidth = false,
  size = 'md',
  className,
}: GlassSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      updatePosition();
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className={cn(
        'fixed z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto',
        glassDropdown
      )}
      style={{top: position.top,
        left: position.left,
        width: position.width,
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => !option.disabled && handleSelect(option.value)}
          disabled={option.disabled}
          className={cn(
            'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors',
            option.disabled
              ? 'text-white/30 cursor-not-allowed'
              : option.value === value
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-white/90 hover:bg-white/10'
          )}
        >
          <span className="flex items-center gap-2">
            {option.icon && <span className="w-4 h-4">{option.icon}</span>}
            {option.label}
          </span>
          {option.value === value && <Check className="w-4 h-4" />}
        </button>
)}
    </div>
  );

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label className="text-sm font-medium text-white/80">{label}</label>
)}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between',
          'backdrop-blur-xl bg-white/5 border border-white/15 rounded-lg text-white',
          'focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none',
          'transition-all duration-300',
          selectSizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed',
          fullWidth && 'w-full',
          className
        )}
      >
        <span className={cn(!selectedOption && 'text-white/50')}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon && (
                <span className="w-4 h-4">{selectedOption.icon}</span>
)}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-white/50 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {typeof document !== 'undefined' &&
        createPortal(dropdownContent, document.body)}
    </div>
  );
}

export default GlassDropdown;

