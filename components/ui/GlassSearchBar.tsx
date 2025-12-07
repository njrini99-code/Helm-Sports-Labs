'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
  type LucideIcon,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface SearchSuggestion {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface GlassSearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  showHistory?: boolean;
  historyKey?: string;
  maxHistoryItems?: number;
  debounceMs?: number;
  variant?: 'default' | 'glass' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
}

// ============================================
// HOOKS
// ============================================

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Search history hook
function useSearchHistory(key: string, maxItems: number = 10) {
  const storageKey = `search_history_${key}`;

  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    }
  }, [storageKey]);

  // Add item to history
  const addToHistory = useCallback(
    (term: string) => {
      if (!term.trim()) return;

      setHistory((prev) => {
        const filtered = prev.filter(
          (item) => item.toLowerCase() !== term.toLowerCase()
        );
        const updated = [term, ...filtered].slice(0, maxItems);

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to save search history:', e);
          }
        }

        return updated;
      });
    },
    [storageKey, maxItems]
  );

  // Remove item from history
  const removeFromHistory = useCallback(
    (term: string) => {
      setHistory((prev) => {
        const updated = prev.filter(
          (item) => item.toLowerCase() !== term.toLowerCase()
        );

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to save search history:', e);
          }
        }

        return updated;
      });
    },
    [storageKey]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.error('Failed to clear search history:', e);
      }
    }
  }, [storageKey]);

  return { history, addToHistory, removeFromHistory, clearHistory };
}

// ============================================
// STYLE CONFIGURATIONS
// ============================================

const variantStyles = {
  default: {
    container: 'bg-white border border-slate-200 shadow-sm',
    containerFocused: 'border-emerald-500 ring-2 ring-emerald-500/20',
    input: 'text-slate-900 placeholder:text-slate-400',
    icon: 'text-slate-400',
    iconFocused: 'text-emerald-500',
    dropdown: 'bg-white border border-slate-200 shadow-lg',
    dropdownItem: 'hover:bg-slate-50',
    dropdownItemActive: 'bg-slate-100',
    dropdownText: 'text-slate-700',
    dropdownSubtext: 'text-slate-500',
    clearButton: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
    historyIcon: 'text-slate-400',
    badge: 'bg-slate-100 text-slate-600',
  },
  glass: {
    container: 'bg-white/10 backdrop-blur-md border border-white/20',
    containerFocused: 'border-emerald-400/50 ring-2 ring-emerald-400/20',
    input: 'text-white placeholder:text-slate-300',
    icon: 'text-slate-300',
    iconFocused: 'text-emerald-400',
    dropdown: 'bg-slate-900/90 backdrop-blur-md border border-white/10',
    dropdownItem: 'hover:bg-white/10',
    dropdownItemActive: 'bg-white/15',
    dropdownText: 'text-white',
    dropdownSubtext: 'text-slate-400',
    clearButton: 'text-slate-300 hover:text-white hover:bg-white/10',
    historyIcon: 'text-slate-400',
    badge: 'bg-white/10 text-slate-300',
  },
  dark: {
    container: 'bg-slate-800 border border-slate-700',
    containerFocused: 'border-emerald-500 ring-2 ring-emerald-500/20',
    input: 'text-slate-100 placeholder:text-slate-500',
    icon: 'text-slate-500',
    iconFocused: 'text-emerald-400',
    dropdown: 'bg-slate-800 border border-slate-700 shadow-xl',
    dropdownItem: 'hover:bg-slate-700',
    dropdownItemActive: 'bg-slate-700',
    dropdownText: 'text-slate-200',
    dropdownSubtext: 'text-slate-500',
    clearButton: 'text-slate-500 hover:text-slate-300 hover:bg-slate-700',
    historyIcon: 'text-slate-500',
    badge: 'bg-slate-700 text-slate-400',
  },
};

const sizeStyles = {
  sm: {
    container: 'h-9',
    input: 'text-sm px-3',
    icon: 'h-4 w-4',
    iconLeft: 'left-2.5',
    iconRight: 'right-2',
    paddingLeft: 'pl-8',
    paddingRight: 'pr-8',
    dropdown: 'text-sm',
    dropdownPadding: 'p-1.5',
    itemPadding: 'px-2.5 py-1.5',
  },
  md: {
    container: 'h-11',
    input: 'text-base px-4',
    icon: 'h-5 w-5',
    iconLeft: 'left-3',
    iconRight: 'right-3',
    paddingLeft: 'pl-10',
    paddingRight: 'pr-10',
    dropdown: 'text-base',
    dropdownPadding: 'p-2',
    itemPadding: 'px-3 py-2',
  },
  lg: {
    container: 'h-14',
    input: 'text-lg px-5',
    icon: 'h-6 w-6',
    iconLeft: 'left-4',
    iconRight: 'right-4',
    paddingLeft: 'pl-12',
    paddingRight: 'pr-12',
    dropdown: 'text-lg',
    dropdownPadding: 'p-2.5',
    itemPadding: 'px-4 py-2.5',
  },
};

// ============================================
// SUGGESTION ITEM COMPONENT
// ============================================

interface SuggestionItemProps {
  suggestion: SearchSuggestion;
  isActive: boolean;
  variant: 'default' | 'glass' | 'dark';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
}

function SuggestionItem({
  suggestion,
  isActive,
  variant,
  size,
  onClick,
}: SuggestionItemProps) {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const Icon = suggestion.icon || Search;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-lg transition-colors',
        sizes.itemPadding,
        styles.dropdownItem,
        isActive && styles.dropdownItemActive
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', styles.dropdownSubtext)} />
      <div className="flex-1 text-left min-w-0">
        <div className={cn('truncate font-medium', styles.dropdownText)}>
          {suggestion.label}
        </div>
        {suggestion.description && (
          <div className={cn('truncate text-sm', styles.dropdownSubtext)}>
            {suggestion.description}
          </div>
        )}
      </div>
      {suggestion.category && (
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full shrink-0',
            styles.badge
          )}
        >
          {suggestion.category}
        </span>
      )}
      <ArrowRight
        className={cn(
          'h-4 w-4 shrink-0 opacity-0 transition-opacity',
          isActive && 'opacity-100',
          styles.dropdownSubtext
        )}
      />
    </button>
  );
}

// ============================================
// HISTORY ITEM COMPONENT
// ============================================

interface HistoryItemProps {
  term: string;
  isActive: boolean;
  variant: 'default' | 'glass' | 'dark';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  onRemove: () => void;
}

function HistoryItem({
  term,
  isActive,
  variant,
  size,
  onClick,
  onRemove,
}: HistoryItemProps) {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg transition-colors group',
        sizes.itemPadding,
        styles.dropdownItem,
        isActive && styles.dropdownItemActive
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex-1 flex items-center gap-3 text-left min-w-0"
      >
        <Clock className={cn('h-4 w-4 shrink-0', styles.historyIcon)} />
        <span className={cn('truncate', styles.dropdownText)}>{term}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
          styles.clearButton
        )}
        aria-label="Remove from history"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function GlassSearchBar({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  onSelect,
  suggestions = [],
  isLoading = false,
  showHistory = true,
  historyKey = 'default',
  maxHistoryItems = 5,
  debounceMs = 300,
  variant = 'glass',
  size = 'md',
  autoFocus = false,
  disabled = false,
  className,
  inputClassName,
  dropdownClassName,
}: GlassSearchBarProps) {
  // State
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Controlled vs uncontrolled value
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  // Debounced value for triggering suggestions
  const debouncedValue = useDebounce(value, debounceMs);

  // Search history
  const { history, addToHistory, removeFromHistory, clearHistory } =
    useSearchHistory(historyKey, maxHistoryItems);

  // Styles
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  // Compute dropdown items
  const dropdownItems = useMemo(() => {
    const items: Array<{
      type: 'suggestion' | 'history' | 'trending';
      data: SearchSuggestion | string;
    }> = [];

    // Add suggestions if we have a search term
    if (value.trim() && suggestions.length > 0) {
      suggestions.forEach((suggestion) => {
        items.push({ type: 'suggestion', data: suggestion });
      });
    }
    // Show history when input is empty or matches
    else if (showHistory && history.length > 0) {
      const filteredHistory = value.trim()
        ? history.filter((term) =>
            term.toLowerCase().includes(value.toLowerCase())
          )
        : history;

      filteredHistory.slice(0, maxHistoryItems).forEach((term) => {
        items.push({ type: 'history', data: term });
      });
    }

    return items;
  }, [value, suggestions, showHistory, history, maxHistoryItems]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setActiveIndex(-1);
    setIsOpen(true);
  };

  // Handle clear
  const handleClear = () => {
    setValue('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  // Handle search submission
  const handleSubmit = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) return;

      addToHistory(searchTerm);
      onSearch?.(searchTerm);
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [addToHistory, onSearch]
  );

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      setValue(suggestion.label);
      addToHistory(suggestion.label);
      onSelect?.(suggestion);
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [addToHistory, onSelect, setValue]
  );

  // Handle history item selection
  const handleSelectHistory = useCallback(
    (term: string) => {
      setValue(term);
      handleSubmit(term);
    },
    [setValue, handleSubmit]
  );

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) =>
          prev < dropdownItems.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < dropdownItems.length) {
          const item = dropdownItems[activeIndex];
          if (item.type === 'suggestion') {
            handleSelectSuggestion(item.data as SearchSuggestion);
          } else if (item.type === 'history') {
            handleSelectHistory(item.data as string);
          }
        } else {
          handleSubmit(value);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const activeElement = dropdownRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      );
      activeElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger onChange with debounced value
  useEffect(() => {
    if (debouncedValue !== value) return;
    // Debounced value is ready - could trigger API call here
  }, [debouncedValue, value]);

  const showDropdown = isOpen && (dropdownItems.length > 0 || isLoading);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input Container */}
      <div
        className={cn(
          'relative rounded-xl transition-all duration-200',
          sizes.container,
          styles.container,
          isFocused && styles.containerFocused,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Search Icon */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 pointer-events-none transition-colors',
            sizes.iconLeft,
            isFocused ? styles.iconFocused : styles.icon
          )}
        >
          {isLoading ? (
            <Loader2 className={cn(sizes.icon, 'animate-spin')} />
          ) : (
            <Search className={sizes.icon} />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={cn(
            'w-full h-full bg-transparent outline-none',
            sizes.input,
            sizes.paddingLeft,
            value && sizes.paddingRight,
            styles.input,
            inputClassName
          )}
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors',
              sizes.iconRight,
              styles.clearButton
            )}
            aria-label="Clear search"
          >
            <X className={sizes.icon} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50',
            'max-h-80 overflow-y-auto',
            sizes.dropdown,
            sizes.dropdownPadding,
            styles.dropdown,
            dropdownClassName
          )}
        >
          {/* Loading State */}
          {isLoading && (
            <div
              className={cn(
                'flex items-center justify-center py-6',
                styles.dropdownSubtext
              )}
            >
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Searching...</span>
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && value.trim() && suggestions.length > 0 && (
            <div className="space-y-1">
              <div
                className={cn(
                  'text-xs font-medium uppercase tracking-wider px-3 py-1.5',
                  styles.dropdownSubtext
                )}
              >
                Suggestions
              </div>
              {dropdownItems
                .filter((item) => item.type === 'suggestion')
                .map((item, index) => (
                  <div key={(item.data as SearchSuggestion).id} data-index={index}>
                    <SuggestionItem
                      suggestion={item.data as SearchSuggestion}
                      isActive={activeIndex === index}
                      variant={variant}
                      size={size}
                      onClick={() =>
                        handleSelectSuggestion(item.data as SearchSuggestion)
                      }
                    />
                  </div>
                ))}
            </div>
          )}

          {/* History */}
          {!isLoading &&
            showHistory &&
            dropdownItems.some((item) => item.type === 'history') && (
              <div className="space-y-1">
                <div
                  className={cn(
                    'flex items-center justify-between px-3 py-1.5'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium uppercase tracking-wider',
                      styles.dropdownSubtext
                    )}
                  >
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className={cn(
                      'text-xs hover:underline',
                      styles.dropdownSubtext
                    )}
                  >
                    Clear all
                  </button>
                </div>
                {dropdownItems
                  .filter((item) => item.type === 'history')
                  .map((item, idx) => {
                    const index = dropdownItems.findIndex(
                      (i) => i.type === 'history' && i.data === item.data
                    );
                    return (
                      <div key={item.data as string} data-index={index}>
                        <HistoryItem
                          term={item.data as string}
                          isActive={activeIndex === index}
                          variant={variant}
                          size={size}
                          onClick={() => handleSelectHistory(item.data as string)}
                          onRemove={() => removeFromHistory(item.data as string)}
                        />
                      </div>
                    );
                  })}
              </div>
            )}

          {/* No Results */}
          {!isLoading &&
            value.trim() &&
            suggestions.length === 0 &&
            !dropdownItems.some((item) => item.type === 'history') && (
              <div
                className={cn(
                  'flex flex-col items-center justify-center py-6 text-center',
                  styles.dropdownSubtext
                )}
              >
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p>No results found for "{value}"</p>
                <p className="text-sm opacity-75">Try a different search term</p>
              </div>
            )}

          {/* Keyboard Hint */}
          {dropdownItems.length > 0 && (
            <div
              className={cn(
                'flex items-center justify-center gap-4 pt-2 mt-2 border-t text-xs',
                variant === 'default'
                  ? 'border-slate-200'
                  : 'border-white/10',
                styles.dropdownSubtext
              )}
            >
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono">
                  ↑↓
                </kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono">
                  ↵
                </kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono">
                  esc
                </kbd>
                close
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// SIMPLE SEARCH INPUT (NO DROPDOWN)
// ============================================

interface SimpleSearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  variant?: 'default' | 'glass' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function SimpleSearchInput({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  variant = 'glass',
  size = 'md',
  disabled = false,
  className,
}: SimpleSearchInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSearch?.(value);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-xl transition-all duration-200',
        sizes.container,
        styles.container,
        isFocused && styles.containerFocused,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Search
        className={cn(
          'absolute top-1/2 -translate-y-1/2 pointer-events-none',
          sizes.iconLeft,
          sizes.icon,
          isFocused ? styles.iconFocused : styles.icon
        )}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full h-full bg-transparent outline-none',
          sizes.input,
          sizes.paddingLeft,
          value && sizes.paddingRight,
          styles.input
        )}
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={() => setValue('')}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors',
            sizes.iconRight,
            styles.clearButton
          )}
        >
          <X className={sizes.icon} />
        </button>
      )}
    </div>
  );
}

// ============================================
// SEARCH WITH BUTTON
// ============================================

interface SearchWithButtonProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  buttonLabel?: string;
  variant?: 'default' | 'glass' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function SearchWithButton({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  buttonLabel = 'Search',
  variant = 'glass',
  size = 'md',
  disabled = false,
  isLoading = false,
  className,
}: SearchWithButtonProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  const handleSubmit = () => {
    if (value.trim() && !disabled && !isLoading) {
      onSearch?.(value);
    }
  };

  const buttonSizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <div
        className={cn(
          'relative flex-1 rounded-xl transition-all duration-200',
          sizes.container,
          styles.container,
          isFocused && styles.containerFocused,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Search
          className={cn(
            'absolute top-1/2 -translate-y-1/2 pointer-events-none',
            sizes.iconLeft,
            sizes.icon,
            isFocused ? styles.iconFocused : styles.icon
          )}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full h-full bg-transparent outline-none',
            sizes.input,
            sizes.paddingLeft,
            styles.input
          )}
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || isLoading || !value.trim()}
        className={cn(
          'rounded-xl font-medium transition-all duration-200',
          'bg-emerald-500 hover:bg-emerald-600 text-white',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center gap-2',
          buttonSizes[size]
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        {buttonLabel}
      </button>
    </div>
  );
}

export default GlassSearchBar;
