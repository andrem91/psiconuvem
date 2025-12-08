/**
 * Utilitários para a visualização de timeline de agenda.
 * Calcula posições CSS baseadas em horários.
 */

// Configurações do grid
export const GRID_START_HOUR = 7 // 07:00
export const GRID_END_HOUR = 22 // 22:00
export const PIXELS_PER_MINUTE = 1.5 // Altura por minuto
export const HOUR_HEIGHT = 60 * PIXELS_PER_MINUTE // 90px por hora

/**
 * Converte uma string de data/hora ISO para posição em pixels no grid.
 */
export function timeToPixels(dateTime: string | Date): number {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
    const hours = date.getHours()
    const minutes = date.getMinutes()

    // Minutos desde o início do grid
    const minutesSinceStart = (hours - GRID_START_HOUR) * 60 + minutes

    return minutesSinceStart * PIXELS_PER_MINUTE
}

/**
 * Converte duração em minutos para altura em pixels.
 */
export function durationToPixels(durationMinutes: number): number {
    return durationMinutes * PIXELS_PER_MINUTE
}

/**
 * Retorna a altura total do grid em pixels.
 */
export function getGridHeight(): number {
    return (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT
}

/**
 * Gera as labels de hora para o grid (07:00, 08:00, etc).
 */
export function getHourLabels(): string[] {
    const labels: string[] = []
    for (let hour = GRID_START_HOUR; hour <= GRID_END_HOUR; hour++) {
        labels.push(`${String(hour).padStart(2, '0')}:00`)
    }
    return labels
}

/**
 * Formata data para YYYY-MM-DD (usado em query params).
 */
export function formatDateParam(date: Date): string {
    const isoString = date.toISOString()
    return isoString.substring(0, 10) // YYYY-MM-DD
}

/**
 * Parse de data de query param.
 */
export function parseDateParam(param: string | undefined | null): Date {
    if (!param) return new Date()
    const parsed = new Date(param + 'T00:00:00')
    return isNaN(parsed.getTime()) ? new Date() : parsed
}

/**
 * Retorna a posição atual em pixels (para a linha do "agora").
 */
export function getCurrentTimePosition(): number | null {
    const now = new Date()
    const hours = now.getHours()

    // Se fora do horário do grid, não mostra
    if (hours < GRID_START_HOUR || hours >= GRID_END_HOUR) {
        return null
    }

    return timeToPixels(now)
}

/**
 * Verifica se uma data é hoje.
 */
export function isToday(date: Date): boolean {
    const today = new Date()
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    )
}
