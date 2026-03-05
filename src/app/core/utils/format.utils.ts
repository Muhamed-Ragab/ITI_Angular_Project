/**
 * Format a number as Egyptian Pound (EGP) currency
 * Uses Intl.NumberFormat for proper localization
 *
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "EGP 1,234.56")
 *
 * @example
 * formatCurrency(1234.56) // 'EGP 1,234.56'
 * formatCurrency(1234.56, { showDecimals: false }) // 'EGP 1,235'
 */
export function formatCurrency(
  amount: number,
  options: {
    showDecimals?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
): string {
  const {
    showDecimals = true,
    minimumFractionDigits = showDecimals ? 2 : 0,
    maximumFractionDigits = showDecimals ? 2 : 0,
  } = options;

  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Format a date with relative time (e.g., "created 2 hours ago")
 * Uses Intl.RelativeTimeFormat for proper localization
 *
 * @param dateString - The date string to format
 * @param options - Optional formatting options
 * @returns Formatted relative time string
 *
 * @example
 * formatRelativeTime('2024-01-15T10:30:00Z') // 'created 2 hours ago'
 * formatRelativeTime('2024-01-15T10:30:00Z', { prefix: 'updated' }) // 'updated 2 hours ago'
 */
export function formatRelativeTime(
  dateString: string | Date,
  options: {
    prefix?: 'created' | 'updated' | 'ordered' | 'paid';
    showExactTime?: boolean;
  } = {},
): string {
  const { prefix = 'created', showExactTime = false } = options;

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  let relativeTime: string;

  if (diffSeconds < 60) {
    relativeTime = rtf.format(-diffSeconds, 'second');
  } else if (diffMinutes < 60) {
    relativeTime = rtf.format(-diffMinutes, 'minute');
  } else if (diffHours < 24) {
    relativeTime = rtf.format(-diffHours, 'hour');
  } else if (diffDays < 7) {
    relativeTime = rtf.format(-diffDays, 'day');
  } else if (diffWeeks < 4) {
    relativeTime = rtf.format(-diffWeeks, 'week');
  } else if (diffMonths < 12) {
    relativeTime = rtf.format(-diffMonths, 'month');
  } else {
    relativeTime = rtf.format(-diffYears, 'year');
  }

  if (showExactTime) {
    const timeStr = date.toLocaleTimeString('en-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${prefix} ${relativeTime} at ${timeStr}`;
  }

  return `${prefix} ${relativeTime}`;
}

/**
 * Format a date to a readable string
 *
 * @param dateString - The date string to format
 * @param options - Optional formatting options
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-01-15T10:30:00Z') // 'Jan 15, 2024'
 * formatDate('2024-01-15T10:30:00Z', { showTime: true }) // 'Jan 15, 2024, 10:30 AM'
 */
export function formatDate(
  dateString: string | Date,
  options: {
    showTime?: boolean;
    showYear?: boolean;
  } = {},
): string {
  const { showTime = false, showYear = true } = options;

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  const dateFormat: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...(showYear && { year: 'numeric' }),
  };

  if (showTime) {
    dateFormat.hour = '2-digit';
    dateFormat.minute = '2-digit';
  }

  return date.toLocaleDateString('en-EG', dateFormat);
}
