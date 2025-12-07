/**
 * Utilities for working with month parameters in financial views
 */

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Parse month parameter and return date range
 */
export function parseMonthParam(monthParam: string | undefined): { 
    year: number
    month: number
    startDate: Date
    endDate: Date
    monthStr: string
} {
    const currentMonth = getCurrentMonth()
    const param = monthParam || currentMonth
    const parts = param.split('-')
    const year = parseInt(parts[0] || '2024', 10)
    const month = parseInt(parts[1] || '1', 10)

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59) // Último dia do mês
    const monthStr = `${year}-${String(month).padStart(2, '0')}`

    return { year, month, startDate, endDate, monthStr }
}

/**
 * Month names in Portuguese
 */
export const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
