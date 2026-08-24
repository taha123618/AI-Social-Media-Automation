import { format } from 'date-fns';

// Use consistent formatting to prevent hydration mismatches
export function formatDate(date: Date | string, formatStr: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, {
    useAdditionalWeekYearTokens: false,
    useAdditionalDayOfYearTokens: false,
  });
}

// Format dates consistently for display
export function formatDateShort(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy');
}

export function formatDateLong(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy HH:mm');
}

export function formatDateRelative(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy');
}
