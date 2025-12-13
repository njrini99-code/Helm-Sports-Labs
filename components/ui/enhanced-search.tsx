'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchSuggestion {
  id: string;
  label: string;
  category?: string;
}

interface EnhancedSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  suggestions?: SearchSuggestion[];
  className?: string;
  showHistory?: boolean;
}

export function EnhancedSearch({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  suggestions = [],
  className,
  showHistory = true,
}: EnhancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('search-history');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history).slice(0, 5));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchValue: string) => {
    if (!searchValue.trim()) return;

    // Add to history
    const newHistory = [searchValue, ...searchHistory.filter(h => h !== searchValue)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('search-history', JSON.stringify(newHistory));

    onSearch?.(searchValue);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const displaySuggestions = value.trim() ? suggestions : (showHistory ? searchHistory.map(h => ({ id: h, label: h })) : []);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={2} />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10 h-9 bg-slate-50 border-slate-200 text-sm dark:bg-slate-900 dark:border-slate-700"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
)}
      </div>
      {/* Suggestions Dropdown */}
      {isOpen && displaySuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {value.trim() ? (
            <div className="p-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 mb-1">
                Suggestions
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => {
                    onChange(suggestion.label);
                    handleSearch(suggestion.label);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {suggestion.label}
                    </div>
                    {suggestion.category && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {suggestion.category}
                      </div>
)}
                  </div>
                  <Search className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" strokeWidth={2} />
                </button>
)}
            </div>
          ) : (
            <div className="p-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={2} />
                Recent searches
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChange(item);
                    handleSearch(item);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{item}</span>
                  <Search className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" strokeWidth={2} />
                </button>
)}
            </div>
)}
        </div>
)}
    </div>
  );
}
