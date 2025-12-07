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
  Filter,
  X,
  Check,
  ChevronDown,
  Loader2,
  Search,
  type LucideIcon,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface FilterOption {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  count?: number;
  disabled?: boolean;
  group?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface GlassFilterDropdownProps {
  label?: string;
  icon?: LucideIcon;
  options: FilterOption[] | FilterGroup[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  variant?: 'default' | 'glass' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  maxHeight?: number;
  showCounts?: boolean;
  showSelectAll?: boolean;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  badgeVariant?: 'count' | 'dot' | 'none';
  align?: 'left' | 'right';
}

// ============================================
// HELPERS
// ============================================

function isGroupedOptions(
  options: FilterOption[] | FilterGroup[]
): options is FilterGroup[] {
  return options.length > 0 && 'options' in options[0];
}

function flattenOptions(options: FilterOption[] | FilterGroup[]): FilterOption[] {
  if (isGroupedOptions(options)) {
    return options.flatMap((group) => group.options);
  }
  return options;
}

// ============================================
// STYLE CONFIGURATIONS
// ============================================

const variantStyles = {
  default: {
    trigger: 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300',
    triggerActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
    dropdown: 'bg-white border border-slate-200 shadow-lg',
    option: 'hover:bg-slate-50 text-slate-700',
    optionActive: 'bg-slate-100',
    optionSelected: 'bg-emerald-50',
    checkbox: 'border-slate-300 group-hover:border-slate-400',
    checkboxChecked: 'bg-emerald-500 border-emerald-500',
    groupLabel: 'text-slate-500 bg-slate-50',
    search: 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400',
    badge: 'bg-emerald-500 text-white',
    badgeDot: 'bg-emerald-500',
    count: 'text-slate-400',
    clearButton: 'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
    selectAll: 'text-emerald-600 hover:text-emerald-700',
    divider: 'border-slate-200',
    description: 'text-slate-500',
  },
  glass: {
    trigger: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/15',
    triggerActive: 'border-emerald-400/50 ring-2 ring-emerald-400/20',
    dropdown: 'bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-xl',
    option: 'hover:bg-white/10 text-slate-200',
    optionActive: 'bg-white/15',
    optionSelected: 'bg-emerald-500/20',
    checkbox: 'border-slate-500 group-hover:border-slate-400',
    checkboxChecked: 'bg-emerald-500 border-emerald-500',
    groupLabel: 'text-slate-400 bg-white/5',
    search: 'bg-white/5 border-white/10 text-white placeholder:text-slate-400',
    badge: 'bg-emerald-500 text-white',
    badgeDot: 'bg-emerald-400',
    count: 'text-slate-500',
    clearButton: 'text-slate-400 hover:text-white hover:bg-white/10',
    selectAll: 'text-emerald-400 hover:text-emerald-300',
    divider: 'border-white/10',
    description: 'text-slate-400',
  },
  dark: {
    trigger: 'bg-slate-800 border border-slate-700 text-slate-200 hover:border-slate-600',
    triggerActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
    dropdown: 'bg-slate-800 border border-slate-700 shadow-xl',
    option: 'hover:bg-slate-700 text-slate-200',
    optionActive: 'bg-slate-700',
    optionSelected: 'bg-emerald-500/20',
    checkbox: 'border-slate-600 group-hover:border-slate-500',
    checkboxChecked: 'bg-emerald-500 border-emerald-500',
    groupLabel: 'text-slate-500 bg-slate-700/50',
    search: 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500',
    badge: 'bg-emerald-500 text-white',
    badgeDot: 'bg-emerald-500',
    count: 'text-slate-500',
    clearButton: 'text-slate-500 hover:text-slate-300 hover:bg-slate-700',
    selectAll: 'text-emerald-400 hover:text-emerald-300',
    divider: 'border-slate-700',
    description: 'text-slate-500',
  },
};

const sizeStyles = {
  sm: {
    trigger: 'h-8 px-2.5 text-sm gap-1.5',
    dropdown: 'min-w-[200px]',
    option: 'px-2.5 py-1.5 text-sm',
    checkbox: 'h-3.5 w-3.5',
    checkIcon: 'h-2.5 w-2.5',
    badge: 'h-4 min-w-4 text-xs',
    badgeDot: 'h-2 w-2',
    search: 'h-8 text-sm px-2.5',
    groupLabel: 'px-2.5 py-1 text-xs',
    icon: 'h-3.5 w-3.5',
  },
  md: {
    trigger: 'h-10 px-3 text-sm gap-2',
    dropdown: 'min-w-[240px]',
    option: 'px-3 py-2 text-sm',
    checkbox: 'h-4 w-4',
    checkIcon: 'h-3 w-3',
    badge: 'h-5 min-w-5 text-xs',
    badgeDot: 'h-2.5 w-2.5',
    search: 'h-9 text-sm px-3',
    groupLabel: 'px-3 py-1.5 text-xs',
    icon: 'h-4 w-4',
  },
  lg: {
    trigger: 'h-12 px-4 text-base gap-2.5',
    dropdown: 'min-w-[280px]',
    option: 'px-4 py-2.5 text-base',
    checkbox: 'h-5 w-5',
    checkIcon: 'h-3.5 w-3.5',
    badge: 'h-6 min-w-6 text-sm',
    badgeDot: 'h-3 w-3',
    search: 'h-10 text-base px-4',
    groupLabel: 'px-4 py-2 text-sm',
    icon: 'h-5 w-5',
  },
};

// ============================================
// CHECKBOX COMPONENT
// ============================================

interface CheckboxProps {
  checked: boolean;
  variant: 'default' | 'glass' | 'dark';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

function Checkbox({ checked, variant, size, disabled }: CheckboxProps) {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <div
      className={cn(
        'rounded border-2 flex items-center justify-center transition-all shrink-0',
        sizes.checkbox,
        checked ? styles.checkboxChecked : styles.checkbox,
        disabled && 'opacity-50'
      )}
    >
      {checked && (
        <Check className={cn(sizes.checkIcon, 'text-white stroke-[3]')} />
      )}
    </div>
  );
}

// ============================================
// OPTION ITEM COMPONENT
// ============================================

interface OptionItemProps {
  option: FilterOption;
  isSelected: boolean;
  isActive: boolean;
  variant: 'default' | 'glass' | 'dark';
  size: 'sm' | 'md' | 'lg';
  showCounts: boolean;
  onClick: () => void;
}

function OptionItem({
  option,
  isSelected,
  isActive,
  variant,
  size,
  showCounts,
  onClick,
}: OptionItemProps) {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={option.disabled}
      className={cn(
        'w-full flex items-center gap-3 rounded-lg transition-colors group',
        sizes.option,
        styles.option,
        isActive && styles.optionActive,
        isSelected && styles.optionSelected,
        option.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Checkbox
        checked={isSelected}
        variant={variant}
        size={size}
        disabled={option.disabled}
      />
      {Icon && (
        <Icon className={cn(sizes.icon, 'shrink-0', styles.description)} />
      )}
      <div className="flex-1 text-left min-w-0">
        <div className="truncate">{option.label}</div>
        {option.description && (
          <div className={cn('text-xs truncate', styles.description)}>
            {option.description}
          </div>
        )}
      </div>
      {showCounts && option.count !== undefined && (
        <span className={cn('text-xs tabular-nums shrink-0', styles.count)}>
          {option.count}
        </span>
      )}
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function GlassFilterDropdown({
  label = 'Filter',
  icon: CustomIcon,
  options,
  selectedValues,
  onChange,
  placeholder,
  searchPlaceholder = 'Search filters...',
  showSearch = false,
  isLoading = false,
  loadingText = 'Loading filters...',
  emptyText = 'No filters available',
  variant = 'glass',
  size = 'md',
  maxHeight = 300,
  showCounts = true,
  showSelectAll = true,
  disabled = false,
  className,
  dropdownClassName,
  badgeVariant = 'count',
  align = 'left',
}: GlassFilterDropdownProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Styles
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  // Flatten and filter options
  const allOptions = useMemo(() => flattenOptions(options), [options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase();

    if (isGroupedOptions(options)) {
      return options
        .map((group) => ({
          ...group,
          options: group.options.filter(
            (opt) =>
              opt.label.toLowerCase().includes(query) ||
              opt.description?.toLowerCase().includes(query)
          ),
        }))
        .filter((group) => group.options.length > 0);
    }

    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const flatFilteredOptions = useMemo(
    () => flattenOptions(filteredOptions),
    [filteredOptions]
  );

  // Computed values
  const selectedCount = selectedValues.length;
  const allSelected =
    allOptions.length > 0 &&
    allOptions.every(
      (opt) => opt.disabled || selectedValues.includes(opt.id)
    );
  const someSelected = selectedCount > 0 && !allSelected;

  const Icon = CustomIcon || Filter;

  // Handlers
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    setSearchQuery('');
    setActiveIndex(-1);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const handleOptionToggle = useCallback(
    (optionId: string) => {
      const option = allOptions.find((opt) => opt.id === optionId);
      if (option?.disabled) return;

      const newValues = selectedValues.includes(optionId)
        ? selectedValues.filter((v) => v !== optionId)
        : [...selectedValues, optionId];

      onChange(newValues);
    },
    [selectedValues, onChange, allOptions]
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onChange([]);
    } else {
      const enabledOptions = allOptions
        .filter((opt) => !opt.disabled)
        .map((opt) => opt.id);
      onChange(enabledOptions);
    }
  }, [allSelected, allOptions, onChange]);

  const handleClearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < flatFilteredOptions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < flatFilteredOptions.length) {
          handleOptionToggle(flatFilteredOptions[activeIndex].id);
        }
        break;

      case 'Escape':
        e.preventDefault();
        handleClose();
        break;

      case 'Tab':
        handleClose();
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && optionsRef.current) {
      const activeElement = optionsRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      );
      activeElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen, showSearch]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClose]);

  // Track option index for keyboard nav
  let optionIndex = -1;

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-all duration-200',
          sizes.trigger,
          styles.trigger,
          isOpen && styles.triggerActive,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Icon className={sizes.icon} />
        <span className="truncate">{placeholder || label}</span>

        {/* Badge */}
        {badgeVariant === 'count' && selectedCount > 0 && (
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full font-medium',
              sizes.badge,
              styles.badge
            )}
          >
            {selectedCount}
          </span>
        )}
        {badgeVariant === 'dot' && selectedCount > 0 && (
          <span className={cn('rounded-full', sizes.badgeDot, styles.badgeDot)} />
        )}

        <ChevronDown
          className={cn(
            sizes.icon,
            'transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-2 rounded-xl overflow-hidden z-50',
            sizes.dropdown,
            styles.dropdown,
            align === 'right' ? 'right-0' : 'left-0',
            dropdownClassName
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Search */}
          {showSearch && (
            <div className="p-2">
              <div className="relative">
                <Search
                  className={cn(
                    'absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none',
                    sizes.icon,
                    styles.description
                  )}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  placeholder={searchPlaceholder}
                  className={cn(
                    'w-full rounded-lg border pl-9 pr-3 outline-none transition-colors',
                    'focus:ring-2 focus:ring-emerald-500/20',
                    sizes.search,
                    styles.search
                  )}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className={cn(
                      'absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded',
                      styles.clearButton
                    )}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Header Actions */}
          {(showSelectAll || selectedCount > 0) && !isLoading && (
            <div
              className={cn(
                'flex items-center justify-between px-3 py-2 border-b',
                styles.divider
              )}
            >
              {showSelectAll && flatFilteredOptions.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={cn('text-sm font-medium', styles.selectAll)}
                >
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>
              )}
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className={cn(
                    'text-sm flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
                    styles.clearButton
                  )}
                >
                  <X className="h-3 w-3" />
                  Clear ({selectedCount})
                </button>
              )}
            </div>
          )}

          {/* Options */}
          <div
            ref={optionsRef}
            className="overflow-y-auto p-1.5"
            style={{ maxHeight }}
          >
            {/* Loading State */}
            {isLoading && (
              <div
                className={cn(
                  'flex items-center justify-center py-8 gap-2',
                  styles.description
                )}
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{loadingText}</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && flatFilteredOptions.length === 0 && (
              <div
                className={cn(
                  'flex flex-col items-center justify-center py-8 text-center',
                  styles.description
                )}
              >
                <Filter className="h-8 w-8 mb-2 opacity-50" />
                <p>{searchQuery ? `No results for "${searchQuery}"` : emptyText}</p>
              </div>
            )}

            {/* Grouped Options */}
            {!isLoading &&
              isGroupedOptions(filteredOptions) &&
              filteredOptions.map((group) => (
                <div key={group.id} className="mb-2 last:mb-0">
                  <div
                    className={cn(
                      'font-medium uppercase tracking-wider rounded-md mb-1',
                      sizes.groupLabel,
                      styles.groupLabel
                    )}
                  >
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.options.map((option) => {
                      optionIndex++;
                      const currentIndex = optionIndex;
                      return (
                        <div key={option.id} data-index={currentIndex}>
                          <OptionItem
                            option={option}
                            isSelected={selectedValues.includes(option.id)}
                            isActive={activeIndex === currentIndex}
                            variant={variant}
                            size={size}
                            showCounts={showCounts}
                            onClick={() => handleOptionToggle(option.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* Flat Options */}
            {!isLoading &&
              !isGroupedOptions(filteredOptions) &&
              filteredOptions.map((option) => {
                optionIndex++;
                const currentIndex = optionIndex;
                return (
                  <div key={option.id} data-index={currentIndex}>
                    <OptionItem
                      option={option}
                      isSelected={selectedValues.includes(option.id)}
                      isActive={activeIndex === currentIndex}
                      variant={variant}
                      size={size}
                      showCounts={showCounts}
                      onClick={() => handleOptionToggle(option.id)}
                    />
                  </div>
                );
              })}
          </div>

          {/* Keyboard Hint */}
          {flatFilteredOptions.length > 0 && !isLoading && (
            <div
              className={cn(
                'flex items-center justify-center gap-4 px-3 py-2 border-t text-xs',
                styles.divider,
                styles.description
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
                  Space
                </kbd>
                toggle
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
// MULTI-FILTER BAR (Multiple Filter Dropdowns)
// ============================================

export interface FilterConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  options: FilterOption[] | FilterGroup[];
  showSearch?: boolean;
}

interface MultiFilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string[]>;
  onChange: (filterId: string, values: string[]) => void;
  onClearAll?: () => void;
  variant?: 'default' | 'glass' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MultiFilterBar({
  filters,
  values,
  onChange,
  onClearAll,
  variant = 'glass',
  size = 'md',
  className,
}: MultiFilterBarProps) {
  const styles = variantStyles[variant];
  const totalSelected = Object.values(values).flat().length;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {filters.map((filter) => (
        <GlassFilterDropdown
          key={filter.id}
          label={filter.label}
          icon={filter.icon}
          options={filter.options}
          selectedValues={values[filter.id] || []}
          onChange={(newValues) => onChange(filter.id, newValues)}
          showSearch={filter.showSearch}
          variant={variant}
          size={size}
        />
      ))}

      {totalSelected > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
            styles.clearButton
          )}
        >
          <X className="h-3.5 w-3.5" />
          Clear all ({totalSelected})
        </button>
      )}
    </div>
  );
}

// ============================================
// ACTIVE FILTERS DISPLAY
// ============================================

interface ActiveFiltersProps {
  filters: FilterConfig[];
  values: Record<string, string[]>;
  onRemove: (filterId: string, optionId: string) => void;
  onClearAll?: () => void;
  variant?: 'default' | 'glass' | 'dark';
  className?: string;
}

export function ActiveFilters({
  filters,
  values,
  onRemove,
  onClearAll,
  variant = 'glass',
  className,
}: ActiveFiltersProps) {
  const styles = variantStyles[variant];

  const activeFilters = useMemo(() => {
    const result: Array<{
      filterId: string;
      filterLabel: string;
      optionId: string;
      optionLabel: string;
    }> = [];

    filters.forEach((filter) => {
      const selectedValues = values[filter.id] || [];
      const allOptions = flattenOptions(filter.options);

      selectedValues.forEach((optionId) => {
        const option = allOptions.find((opt) => opt.id === optionId);
        if (option) {
          result.push({
            filterId: filter.id,
            filterLabel: filter.label,
            optionId: option.id,
            optionLabel: option.label,
          });
        }
      });
    });

    return result;
  }, [filters, values]);

  if (activeFilters.length === 0) return null;

  const badgeStyles = {
    default: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    glass: 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 backdrop-blur-sm',
    dark: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30',
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className={cn('text-sm', styles.description)}>Active filters:</span>
      {activeFilters.map((filter) => (
        <button
          key={`${filter.filterId}-${filter.optionId}`}
          type="button"
          onClick={() => onRemove(filter.filterId, filter.optionId)}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm transition-colors group',
            badgeStyles[variant]
          )}
        >
          <span className="opacity-75">{filter.filterLabel}:</span>
          <span className="font-medium">{filter.optionLabel}</span>
          <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
        </button>
      ))}
      {onClearAll && activeFilters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className={cn(
            'text-sm px-2 py-1 rounded transition-colors',
            styles.clearButton
          )}
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// ============================================
// SIMPLE SINGLE-SELECT FILTER
// ============================================

interface SingleSelectFilterProps {
  label?: string;
  icon?: LucideIcon;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  variant?: 'default' | 'glass' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function SingleSelectFilter({
  label = 'Filter',
  icon: CustomIcon,
  options,
  value,
  onChange,
  placeholder,
  variant = 'glass',
  size = 'md',
  disabled = false,
  className,
}: SingleSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  const Icon = CustomIcon || Filter;
  const selectedOption = options.find((opt) => opt.id === value);

  const handleSelect = (optionId: string) => {
    onChange(optionId === value ? null : optionId);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < options.length) {
          handleSelect(options[activeIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-all duration-200',
          sizes.trigger,
          styles.trigger,
          isOpen && styles.triggerActive,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Icon className={sizes.icon} />
        <span className="truncate">
          {selectedOption?.label || placeholder || label}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className={cn('p-0.5 rounded', styles.clearButton)}
          >
            <X className="h-3 w-3" />
          </button>
        )}
        <ChevronDown
          className={cn(
            sizes.icon,
            'transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-2 left-0 rounded-xl overflow-hidden z-50 p-1.5',
            sizes.dropdown,
            styles.dropdown
          )}
          onKeyDown={handleKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.id === value;
            const OptionIcon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                disabled={option.disabled}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg transition-colors',
                  sizes.option,
                  styles.option,
                  activeIndex === index && styles.optionActive,
                  isSelected && styles.optionSelected,
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {OptionIcon && (
                  <OptionIcon
                    className={cn(sizes.icon, 'shrink-0', styles.description)}
                  />
                )}
                <span className="flex-1 text-left truncate">{option.label}</span>
                {isSelected && (
                  <Check className={cn(sizes.icon, 'text-emerald-500 shrink-0')} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GlassFilterDropdown;
