import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    parseUTCDate,
    formatDate,
    formatTime,
    formatDateTime,
    getTodayDateString,
} from '@/lib/utils/date'

describe('date utilities', () => {
    describe('parseUTCDate', () => {
        it('should parse date with Z suffix', () => {
            const result = parseUTCDate('2024-03-15T10:30:00Z')
            expect(result.toISOString()).toBe('2024-03-15T10:30:00.000Z')
        })

        it('should parse date with timezone offset', () => {
            const result = parseUTCDate('2024-03-15T10:30:00+03:00')
            expect(result.toISOString()).toBe('2024-03-15T07:30:00.000Z')
        })

        it('should add Z suffix to dates without timezone', () => {
            const result = parseUTCDate('2024-03-15T10:30:00')
            expect(result.toISOString()).toBe('2024-03-15T10:30:00.000Z')
        })
    })

    describe('formatDate', () => {
        it('should format date in Brazilian format', () => {
            const result = formatDate('2024-03-15T12:00:00Z')
            expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
        })

        it('should show day/month/year order', () => {
            const result = formatDate('2024-01-25T12:00:00Z')
            expect(result).toContain('25')
            expect(result).toContain('01')
            expect(result).toContain('2024')
        })
    })

    describe('formatTime', () => {
        it('should format time in HH:MM format', () => {
            const result = formatTime('2024-03-15T15:30:00Z')
            expect(result).toMatch(/\d{2}:\d{2}/)
        })
    })

    describe('formatDateTime', () => {
        it('should combine date and time', () => {
            const result = formatDateTime('2024-03-15T15:30:00Z')
            expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)
        })
    })

    describe('getTodayDateString', () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })

        afterEach(() => {
            vi.useRealTimers()
        })

        it('should return today in YYYY-MM-DD format', () => {
            vi.setSystemTime(new Date('2024-03-15T10:00:00'))
            expect(getTodayDateString()).toBe('2024-03-15')
        })

        it('should pad single digit month and day', () => {
            vi.setSystemTime(new Date('2024-01-05T10:00:00'))
            expect(getTodayDateString()).toBe('2024-01-05')
        })
    })
})
