import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    GRID_START_HOUR,
    GRID_END_HOUR,
    PIXELS_PER_MINUTE,
    HOUR_HEIGHT,
    timeToPixels,
    durationToPixels,
    getGridHeight,
    getHourLabels,
    formatDateParam,
    parseDateParam,
    getCurrentTimePosition,
    isToday,
} from '@/lib/utils/time-grid'

describe('time-grid utilities', () => {
    describe('constants', () => {
        it('should have consistent grid constants', () => {
            expect(GRID_START_HOUR).toBe(7)
            expect(GRID_END_HOUR).toBe(22)
            expect(PIXELS_PER_MINUTE).toBe(1.5)
            expect(HOUR_HEIGHT).toBe(90) // 60 * 1.5
        })
    })

    describe('timeToPixels', () => {
        it('should return 0 for grid start time', () => {
            const date = new Date('2024-01-15T07:00:00')
            expect(timeToPixels(date)).toBe(0)
        })

        it('should calculate correct pixels for 08:30', () => {
            const date = new Date('2024-01-15T08:30:00')
            // 1h30m = 90 min desde 07:00
            expect(timeToPixels(date)).toBe(90 * PIXELS_PER_MINUTE)
        })

        it('should handle string input', () => {
            const dateStr = '2024-01-15T09:00:00'
            // 2h = 120 min desde 07:00
            expect(timeToPixels(dateStr)).toBe(120 * PIXELS_PER_MINUTE)
        })

        it('should handle noon correctly', () => {
            const date = new Date('2024-01-15T12:00:00')
            // 5h = 300 min desde 07:00
            expect(timeToPixels(date)).toBe(300 * PIXELS_PER_MINUTE)
        })
    })

    describe('durationToPixels', () => {
        it('should convert 50 minutes to correct pixels', () => {
            expect(durationToPixels(50)).toBe(50 * PIXELS_PER_MINUTE)
        })

        it('should convert 1 hour to correct pixels', () => {
            expect(durationToPixels(60)).toBe(HOUR_HEIGHT)
        })

        it('should handle 0 duration', () => {
            expect(durationToPixels(0)).toBe(0)
        })
    })

    describe('getGridHeight', () => {
        it('should calculate total grid height', () => {
            // 22 - 7 = 15 hours
            expect(getGridHeight()).toBe(15 * HOUR_HEIGHT)
        })
    })

    describe('getHourLabels', () => {
        it('should return array of hour labels', () => {
            const labels = getHourLabels()
            expect(labels[0]).toBe('07:00')
            expect(labels[labels.length - 1]).toBe('22:00')
            expect(labels.length).toBe(16) // 07 to 22 inclusive
        })

        it('should pad single digit hours', () => {
            const labels = getHourLabels()
            expect(labels[0]).toBe('07:00')
            expect(labels[2]).toBe('09:00')
        })
    })

    describe('formatDateParam', () => {
        it('should format date as YYYY-MM-DD', () => {
            const date = new Date('2024-03-15T10:30:00Z')
            expect(formatDateParam(date)).toBe('2024-03-15')
        })

        it('should handle different dates', () => {
            const date = new Date('2024-01-01T00:00:00Z')
            expect(formatDateParam(date)).toBe('2024-01-01')
        })
    })

    describe('parseDateParam', () => {
        it('should parse valid date string', () => {
            const result = parseDateParam('2024-03-15')
            expect(result.getFullYear()).toBe(2024)
            expect(result.getMonth()).toBe(2) // March = 2
            expect(result.getDate()).toBe(15)
        })

        it('should return current date for null/undefined', () => {
            const now = new Date()
            const result = parseDateParam(null)
            expect(result.getDate()).toBe(now.getDate())
        })

        it('should return current date for invalid string', () => {
            const now = new Date()
            const result = parseDateParam('invalid-date')
            expect(result.getDate()).toBe(now.getDate())
        })
    })

    describe('getCurrentTimePosition', () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })

        afterEach(() => {
            vi.useRealTimers()
        })

        it('should return null before grid start', () => {
            vi.setSystemTime(new Date('2024-01-15T06:30:00'))
            expect(getCurrentTimePosition()).toBeNull()
        })

        it('should return null after grid end', () => {
            vi.setSystemTime(new Date('2024-01-15T22:30:00'))
            expect(getCurrentTimePosition()).toBeNull()
        })

        it('should return position during grid hours', () => {
            vi.setSystemTime(new Date('2024-01-15T10:00:00'))
            // 3h desde 07:00 = 180 min
            expect(getCurrentTimePosition()).toBe(180 * PIXELS_PER_MINUTE)
        })
    })

    describe('isToday', () => {
        it('should return true for today', () => {
            expect(isToday(new Date())).toBe(true)
        })

        it('should return false for yesterday', () => {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            expect(isToday(yesterday)).toBe(false)
        })

        it('should return false for different year same day/month', () => {
            const lastYear = new Date()
            lastYear.setFullYear(lastYear.getFullYear() - 1)
            expect(isToday(lastYear)).toBe(false)
        })
    })
})
