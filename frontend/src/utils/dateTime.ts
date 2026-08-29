/**
 * Unified Date and Time formatting utilities for Vigil.AI
 * Standard format: YYYY-MM-DD HH:MM:SS UTC
 */

export function formatDateTime(input?: string | number | Date | null): string {
  if (!input) return 'N/A';

  let date: Date;

  if (input instanceof Date) {
    date = input;
  } else if (typeof input === 'number') {
    date = new Date(input);
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    // If it's a relative indicator like "Just now", "2 mins ago", return as is
    if (trimmed.toLowerCase() === 'just now' || /^\d+\s+(min|mins|minute|minutes|hour|hours|day|days|sec|secs)\s+ago$/i.test(trimmed)) {
      return trimmed;
    }
    date = new Date(trimmed);
  } else {
    return 'N/A';
  }

  if (isNaN(date.getTime())) {
    return typeof input === 'string' ? input : 'N/A';
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}
