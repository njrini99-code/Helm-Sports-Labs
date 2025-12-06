/**
 * Date utility functions for ScoutPulse
 *
 * These functions ensure consistent date handling across the application,
 * avoiding timezone-related bugs when working with calendar dates.
 */

/**
 * Formats a Date object to YYYY-MM-DD string in the local timezone.
 * This avoids timezone conversion issues that occur with .toISOString()
 *
 * @param date - The Date object to format
 * @returns Date string in YYYY-MM-DD format (local timezone)
 *
 * @example
 * // User in PST at 11 PM on Dec 15, 2025
 * formatDateLocal(new Date()) // Returns "2025-12-15" (not "2025-12-16")
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date in YYYY-MM-DD format (local timezone)
 *
 * @returns Today's date string in YYYY-MM-DD format
 */
export function getTodayLocal(): string {
  return formatDateLocal(new Date());
}

/**
 * Adds days to a date and returns YYYY-MM-DD string in local timezone
 *
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * addDaysLocal(new Date(), 14) // Returns date 14 days from now
 */
export function addDaysLocal(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return formatDateLocal(result);
}

/**
 * Parses a YYYY-MM-DD string into a Date object at midnight local time
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object set to midnight local time
 *
 * @example
 * parseDateLocal('2025-12-15') // Returns Date object for Dec 15, 2025 00:00:00 local
 */
export function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Checks if a date string is today (local timezone)
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns True if the date is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayLocal();
}

/**
 * Checks if a date string is in the past (local timezone)
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns True if the date is before today
 */
export function isPast(dateStr: string): boolean {
  return dateStr < getTodayLocal();
}

/**
 * Checks if a date string is in the future (local timezone)
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns True if the date is after today
 */
export function isFuture(dateStr: string): boolean {
  return dateStr > getTodayLocal();
}

/**
 * Formats a date string to a human-readable format
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * formatDateHuman('2025-12-15') // Returns "December 15, 2025"
 * formatDateHuman('2025-12-15', { month: 'short', day: 'numeric' }) // Returns "Dec 15"
 */
export function formatDateHuman(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const date = parseDateLocal(dateStr);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}
