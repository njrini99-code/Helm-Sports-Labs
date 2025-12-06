'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { glassButton } from '@/lib/glassmorphism';

export interface GlassModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal description/subtitle */
  description?: string;
  /** Modal content */
  children: ReactNode;
  /** Footer content (buttons, etc.) */
  footer?: ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Hide the close button */
  hideCloseButton?: boolean;
  /** Additional class name for the modal content */
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function GlassModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  hideCloseButton = false,
  className,
}: GlassModalProps) {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'glass-modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full animate-in fade-in zoom-in-95 duration-200',
          sizeClasses[size],
          className
        )}
      >
        <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-white/15 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Header */}
          {(title || !hideCloseButton) && (
            <div className="flex items-start justify-between p-5 border-b border-white/10">
              <div>
                {title && (
                  <h2
                    id="glass-modal-title"
                    className="text-lg font-semibold text-white"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-white/60">{description}</p>
                )}
              </div>
              {!hideCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 -m-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-5 max-h-[60vh] overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10 bg-white/[0.02]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render at document root
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// GlassConfirmModal - Pre-built confirmation modal
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export function GlassConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: GlassConfirmModalProps) {
  const confirmButtonClass =
    variant === 'danger'
      ? 'backdrop-blur-xl bg-gradient-to-br from-red-500/90 to-red-600/90 border border-white/20 shadow-lg shadow-red-500/30 text-white rounded-lg px-6 py-2.5 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 disabled:opacity-50'
      : glassButton.primary.replace('py-3', 'py-2.5');

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className={cn(
              glassButton.ghost.replace('py-3', 'py-2.5'),
              'disabled:opacity-50'
            )}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={confirmButtonClass}
          >
            {loading ? 'Loading...' : confirmText}
          </button>
        </>
      }
    >
      {/* Empty content - title/description in header is enough */}
      <div />
    </GlassModal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GlassDrawer - Side panel drawer
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Called when the drawer should close */
  onClose: () => void;
  /** Drawer title */
  title?: string;
  /** Drawer content */
  children: ReactNode;
  /** Which side the drawer appears from */
  side?: 'left' | 'right';
  /** Drawer width */
  width?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional class name */
  className?: string;
}

const drawerWidthClasses = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[480px]',
  xl: 'w-[560px]',
};

export function GlassDrawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  width = 'md',
  className,
}: GlassDrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'absolute top-0 bottom-0 flex flex-col',
          'backdrop-blur-2xl bg-slate-900/95 border-white/15 shadow-2xl shadow-black/50',
          drawerWidthClasses[width],
          side === 'right'
            ? 'right-0 border-l animate-in slide-in-from-right duration-300'
            : 'left-0 border-r animate-in slide-in-from-left duration-300',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 -m-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-auto"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }

  return null;
}

export default GlassModal;

