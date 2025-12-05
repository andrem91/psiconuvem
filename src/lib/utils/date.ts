/**
 * Date utilities for handling timezone-aware date parsing and formatting
 */

/**
 * Parses a date string as UTC, ensuring correct timezone interpretation
 * even if the database returns dates without timezone offset
 */
export function parseUTCDate(dateStr: string): Date {
  const hasTimezone = dateStr.endsWith('Z') || dateStr.includes('+')
  return new Date(hasTimezone ? dateStr : dateStr + 'Z')
}

/**
 * Formats a date string to Brazilian format (DD/MM/YYYY)
 */
export function formatDate(dateStr: string): string {
  const date = parseUTCDate(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
}

/**
 * Formats a date string to Brazilian time format (HH:MM)
 */
export function formatTime(dateStr: string): string {
  const date = parseUTCDate(dateStr)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

/**
 * Formats a date string to full Brazilian format (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`
}
