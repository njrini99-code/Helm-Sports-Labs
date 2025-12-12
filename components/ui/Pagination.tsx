'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════
export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Total number of items (optional, for display) */
  totalItems?: number;
  /** Items per page (optional, for display) */
  pageSize?: number;
  /** Whether dark mode is enabled */
  isDark?: boolean;
  /** Show first/last buttons */
  showFirstLast?: boolean;
  /** Number of page buttons to show */
  siblingCount?: number;
  /** Additional className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper to generate page numbers
// ═══════════════════════════════════════════════════════════════════════════
function getPageNumbers(currentPage: number, totalPages: number, siblingCount: number): (number | 'ellipsis')[] {
  const totalNumbers = siblingCount * 2 + 3; // siblings + current + first + last
  const totalBlocks = totalNumbers + 2; // + 2 for ellipsis

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 1 + 2 * siblingCount + 1;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 1 + 2 * siblingCount + 1;
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
    return [1, 'ellipsis', ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  isDark = false,
  showFirstLast = true,
  siblingCount = 1,
  className,
  size = 'md',
}: PaginationProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages, siblingCount);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const sizeClasses = {
    sm: {
      button: 'h-7 w-7 text-xs',
      text: 'text-xs',
    },
    md: {
      button: 'h-9 w-9 text-sm',
      text: 'text-sm',
    },
  };

  // Calculate showing range
  const startItem = totalItems ? (currentPage - 1) * (pageSize || 20) + 1 : null;
  const endItem = totalItems ? Math.min(currentPage * (pageSize || 20), totalItems) : null;

  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-center justify-between gap-4',
      className
    )}>
      {/* Results info */}
      {totalItems !== undefined && (
        <p className={cn(
          sizeClasses[size].text,
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </p>
)}
      {/* Pagination controls */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* First page */}
        {showFirstLast && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              sizeClasses[size].button,
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-800'
            )}
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious}
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
)}
        {/* Previous page */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            sizeClasses[size].button,
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-800'
          )}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      {/* Page numbers */}
        {{pageNumbers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            pageNumbers.map((pageNumber, index) => {
          if (pageNumber === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className={cn(
                  'px-2',
                  sizeClasses[size].text,
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )}
              >
                ...
              </span>
            );
          }

          const isActive = pageNumber === currentPage;
          return (
            <Button
              key={pageNumber}
              variant={isActive ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                sizeClasses[size].button,
                isActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : isDark 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              )}
              onClick={() => onPageChange(pageNumber)}
              aria-label={`Page ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </Button>
          );
        })
          })

        {/* Next page */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            sizeClasses[size].button,
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-800'
          )}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      {/* Last page */}
        {showFirstLast && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              sizeClasses[size].button,
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-800'
            )}
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
)}
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Simple Pagination (prev/next only)
// ═══════════════════════════════════════════════════════════════════════════
export interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDark?: boolean;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  isDark = false,
  className,
}: SimplePaginationProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          'gap-1',
          isDark ? 'border-slate-600 hover:bg-slate-700' : ''
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
      <span className={cn(
        'px-3 text-sm',
        isDark ? 'text-slate-400' : 'text-slate-500'
      )}>
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          'gap-1',
          isDark ? 'border-slate-600 hover:bg-slate-700' : ''
        )}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default Pagination;


