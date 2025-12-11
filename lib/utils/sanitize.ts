/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitize HTML content by escaping special characters
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitize text content (removes HTML tags)
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize user input for database storage
 * Removes potentially dangerous characters while preserving content
 */
export function sanitizeInput(input: string, maxLength?: number): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate and sanitize UUID
 */
export function sanitizeUuid(input: string): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(input) ? input : null;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: string): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = input.trim().toLowerCase();
  return emailRegex.test(sanitized) ? sanitized : null;
}
