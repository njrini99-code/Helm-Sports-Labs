'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, X, Building2, MapPin, Trophy } from 'lucide-react';

export interface College {
  id: string;
  name: string;
  short_name: string | null;
  nickname: string | null;
  city: string | null;
  state: string | null;
  division: string | null;
  conference: string | null;
  logo_url: string | null;
  slug: string | null;
}

interface CollegeSearchSelectProps {
  value?: College | null;
  onChange: (college: College | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  filterDivision?: string[];
  filterState?: string[];
}

export function CollegeSearchSelect({
  value,
  onChange,
  placeholder = 'Search colleges...',
  disabled = false,
  className = '',
  filterDivision,
  filterState,
}: CollegeSearchSelectProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<College[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchColleges = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    let dbQuery = supabase
      .from('colleges')
      .select('id, name, short_name, nickname, city, state, division, conference, logo_url, slug')
      .eq('is_active', true)
      .or(`name.ilike.%${searchQuery}%,short_name.ilike.%${searchQuery}%,nickname.ilike.%${searchQuery}%`)
      .order('name')
      .limit(20);

    if (filterDivision && filterDivision.length > 0) {
      dbQuery = dbQuery.in('division', filterDivision);
    }
    if (filterState && filterState.length > 0) {
      dbQuery = dbQuery.in('state', filterState);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('College search error:', error);
      setResults([]);
    } else {
      setResults(data || []);
    }
    setIsLoading(false);
  }, [filterDivision, filterState]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchColleges(query);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, searchColleges]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (college: College) => {
    onChange(college);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[highlightIndex]) {
          handleSelect(results[highlightIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const getDivisionColor = (division: string | null) => {
    switch (division) {
      case 'D1': return 'bg-emerald-500/20 text-emerald-400';
      case 'D2': return 'bg-blue-500/20 text-blue-400';
      case 'D3': return 'bg-purple-500/20 text-purple-400';
      case 'JUCO': return 'bg-amber-500/20 text-amber-400';
      case 'NAIA': return 'bg-rose-500/20 text-rose-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selected Value Display */}
      {value ? (
        <div className="flex items-center gap-3 p-3 bg-[#0B1020] border border-white/10 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            {value.logo_url ? (
              <img src={value.logo_url} alt={value.name} className="w-8 h-8 object-contain" loading="lazy" />
            ) : (
              <Building2 className="w-5 h-5 text-white/40" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{value.name}</p>
            <p className="text-sm text-white/50">
              {value.city}, {value.state} • {value.conference}
            </p>
          </div>
          {value.division && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDivisionColor(value.division)}`}>
              {value.division}
            </span>
          )}
          {!disabled && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          )}
        </div>
      ) : (
        /* Search Input */
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-3 bg-[#0B1020] border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all disabled:opacity-50"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && !value && (
        <div className="absolute z-50 w-full mt-2 bg-[#0B1020] border border-white/10 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {results.map((college, index) => (
              <button
                key={college.id}
                onClick={() => handleSelect(college)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                  index === highlightIndex
                    ? 'bg-emerald-500/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {college.logo_url ? (
                    <img src={college.logo_url} alt={college.name} className="w-8 h-8 object-contain" loading="lazy" />
                  ) : (
                    <Building2 className="w-5 h-5 text-white/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {college.name}
                    {college.nickname && (
                      <span className="text-white/50 font-normal"> ({college.nickname})</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <MapPin className="w-3 h-3" />
                    <span>{college.city}, {college.state}</span>
                    {college.conference && (
                      <>
                        <span>•</span>
                        <Trophy className="w-3 h-3" />
                        <span>{college.conference}</span>
                      </>
                    )}
                  </div>
                </div>
                {college.division && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getDivisionColor(college.division)}`}>
                    {college.division}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query && results.length === 0 && !isLoading && !value && (
        <div className="absolute z-50 w-full mt-2 p-4 bg-[#0B1020] border border-white/10 rounded-xl text-center">
          <p className="text-white/50">No colleges found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}

export default CollegeSearchSelect;

