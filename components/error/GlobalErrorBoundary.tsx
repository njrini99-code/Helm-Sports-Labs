'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Error Boundary Component
// ═══════════════════════════════════════════════════════════════════════════

export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Default Error Fallback UI
// ═══════════════════════════════════════════════════════════════════════════

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl w-full">
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-500/20 border border-red-500/30">
              <AlertTriangle className="w-12 h-12 text-red-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Oops! Something went wrong
          </h1>

          {/* Description */}
          <p className="text-white/70 text-center mb-8">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>

          {/* Error Details (Development Only) */}
          {isDev && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs font-mono text-red-300 mb-2">Development Error Details:</p>
              <p className="text-sm font-mono text-white/90 break-words">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-3">
                  <summary className="text-xs text-white/70 cursor-pointer hover:text-white/90">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-[10px] text-white/60 overflow-x-auto max-h-48">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <Link href="/">
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2 w-full">
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-center text-white/50 text-sm mt-8">
            If this problem persists, please contact support at{' '}
            <a href="mailto:support@helmsportslab.com" className="text-blue-400 hover:text-blue-300">
              support@helmsportslab.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Convenience Wrapper Component
// ═══════════════════════════════════════════════════════════════════════════

interface WithErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

export function WithErrorBoundary({ children, fallback }: WithErrorBoundaryProps) {
  return (
    <GlobalErrorBoundary fallback={fallback}>
      {children}
    </GlobalErrorBoundary>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════

export default GlobalErrorBoundary;
