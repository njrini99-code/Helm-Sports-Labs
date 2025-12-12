'use client';

import { useEffect, useCallback, ReactNode } from 'react';
import { X, MoreHorizontal, ExternalLink, Link2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ScoutCardShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  // Header props
  headerContent: ReactNode;
  // Menu actions
  onOpenInNewTab?: () => void;
  onCopyLink?: () => void;
  onExportPDF?: () => void;
  customMenuItems?: ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function ScoutCardShell({
  isOpen,
  onClose,
  children,
  headerContent,
  onOpenInNewTab,
  onCopyLink,
  onExportPDF,
  customMenuItems,
}: ScoutCardShellProps) {
  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - blurred and darkened */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"></div>
{/* Panel - right side drawer */}
      <div 
        className={`
          fixed z-50 bg-white dark:bg-slate-900 shadow-2xl
          transition-transform duration-300 ease-out
          
          /* Mobile: full screen from bottom */
          inset-x-0 bottom-0 top-0
          
          /* Desktop: right side panel, 480-520px width */
          md:inset-y-0 md:right-0 md:left-auto md:w-[500px] md:max-w-[90vw]
          
          overflow-hidden flex flex-col border-l border-slate-200 dark:border-slate-700
          animate-in slide-in-from-right duration-300
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white/10 backdrop-blur-md border border-white/20 dark:bg-slate-900">
          <div className="flex items-start justify-between p-4 gap-3">
            {/* Header Content */}
            <div className="flex-1 min-w-0">
              {headerContent}
            </div>
      {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* 3-dot menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onOpenInNewTab && (
                    <DropdownMenuItem onClick={onOpenInNewTab}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in new tab
                    </DropdownMenuItem>
)}
                  {onCopyLink && (
                    <DropdownMenuItem onClick={onCopyLink}>
                      <Link2 className="w-4 h-4 mr-2" />
                      Copy link
                    </DropdownMenuItem>
)}
                  {onExportPDF && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onExportPDF}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Export PDF
                      </DropdownMenuItem>
                    </>
                  )}
                  {customMenuItems}
                </DropdownMenuContent>
              </DropdownMenu>
      {/* Close button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="h-8 w-8 text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
          {children}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-components for consistent styling
// ═══════════════════════════════════════════════════════════════════════════

export function ScoutCardSection({ 
  title, 
  children, 
  className = '',
  action,
}: { 
  title?: string; 
  children: ReactNode; 
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mx-4 mb-3 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </h3>
          {action}
        </div>
)}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export function ScoutCardActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      {children}
    </div>
  );
}

export function ScoutCardMetricTile({
  value,
  label,
  unit,
  badge,
  icon,
}: {
  value: string | number;
  label: string;
  unit?: string;
  badge?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
      {icon && <div className="text-emerald-500 mb-1">{icon}</div>}
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-800 dark:text-white">{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{label}</span>
      {badge && (
        <span className="mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          {badge}
        </span>
)}
    </div>
  );
}

export function ScoutCardInfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      {icon && <span className="text-slate-400 flex-shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-sm font-medium text-slate-800 dark:text-white truncate">{value}</span>
      </div>
    </div>
  );
}

export function ScoutCardStatusPill({ 
  status, 
  className = '' 
}: { 
  status: string; 
  className?: string;
}) {
  const statusConfig: Record<string, { bg: string; text: string }> = {
    watchlist: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    high_priority: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    offer_extended: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
    committed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
    uninterested: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400' },
  };

  const config = statusConfig[status] || statusConfig.watchlist;
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${config.bg} ${config.text} ${className}`}>
      {label}
    </span>
  );
}
