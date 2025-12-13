/**
 * Centralized error logging utility
 * 
 * In development: logs to console
 * In production: can be extended to send to error tracking service (Sentry, etc.)
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an error with optional context
 * 
 * @param error - The error to log (Error object or unknown)
 * @param context - Optional context string or object
 * @example
 * ```ts
 * logError(error, 'Error loading player data');
 * logError(error, { component: 'PlayerDashboard', action: 'loadData' });
 * ```
 */
export function logError(error: Error | unknown, context?: string | ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // In development, always log to console
  if (process.env.NODE_ENV === 'development') {
    const contextStr = typeof context === 'string' 
      ? context 
      : context 
        ? `${context.component || 'Unknown'}: ${context.action || 'Unknown action'}`
        : undefined;

    console.error(
      contextStr ? `[${contextStr}]` : '',
      errorMessage,
      errorStack ? `\n${errorStack}` : ''
    );

    // Log metadata if provided
    if (context && typeof context === 'object' && context.metadata) {
      console.error('Metadata:', context.metadata);
    }
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Sentry integration
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      try {
        (window as any).Sentry.captureException(error, {
          tags: {
            component: typeof context === 'object' ? context.component : undefined,
            action: typeof context === 'object' ? context.action : undefined,
          },
          user: {
            id: typeof context === 'object' ? context.userId : undefined,
          },
          extra: typeof context === 'object' ? context.metadata : undefined,
        });
      } catch (sentryError) {
        // Fallback to console if Sentry fails
        console.error('Sentry error:', sentryError);
        console.error('Original error:', errorMessage, errorStack);
      }
    }
    
    // LogRocket integration
    if (typeof window !== 'undefined' && (window as any).LogRocket) {
      try {
        (window as any).LogRocket.captureException(error, {
          tags: {
            component: typeof context === 'object' ? context.component : undefined,
            action: typeof context === 'object' ? context.action : undefined,
          },
          extra: typeof context === 'object' ? context.metadata : undefined,
        });
      } catch (lrError) {
        // Silently fail - LogRocket is optional
      }
    }

    // Server-side: Send to error tracking API if configured
    if (typeof window === 'undefined' && process.env.ERROR_TRACKING_API_URL) {
      try {
        fetch(process.env.ERROR_TRACKING_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: errorMessage,
            stack: errorStack,
            context: typeof context === 'object' ? context : { message: context },
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Silently fail - error tracking is non-critical
        });
      } catch (fetchError) {
        // Silently fail
      }
    }
  }
}

/**
 * Log a warning (non-critical issues)
 */
export function logWarning(message: string, context?: string | ErrorContext): void {
  if (process.env.NODE_ENV === 'development') {
    const contextStr = typeof context === 'string' 
      ? context 
      : context 
        ? `${context.component || 'Unknown'}: ${context.action || 'Unknown action'}`
        : undefined;

    console.warn(contextStr ? `[${contextStr}]` : '', message);
  }
}

/**
 * Log informational messages (debugging)
 */
export function logInfo(message: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data || '');
  }
}

