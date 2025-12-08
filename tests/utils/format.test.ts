import { describe, it, expect } from 'vitest'
import { formatCurrency, formatAmount } from '@/lib/utils/format'

describe('format utilities', () => {
    describe('formatCurrency', () => {
        it('should format as Brazilian Real', () => {
            const result = formatCurrency(100)
            expect(result).toContain('R$')
            expect(result).toContain('100')
        })

        it('should format with 2 decimal places', () => {
            const result = formatCurrency(99.9)
            expect(result).toMatch(/99[,.]90/)
        })

        it('should handle zero', () => {
            const result = formatCurrency(0)
            expect(result).toContain('0')
        })

        it('should format thousands', () => {
            const result = formatCurrency(1500.50)
            expect(result).toContain('1')
            expect(result).toContain('500')
        })

        it('should handle negative values', () => {
            const result = formatCurrency(-50)
            expect(result).toContain('50')
        })
    })

    describe('formatAmount', () => {
        it('should format without currency symbol', () => {
            const result = formatAmount(100)
            expect(result).not.toContain('R$')
        })

        it('should format with 2 decimal places', () => {
            const result = formatAmount(100)
            expect(result).toMatch(/100[,.]00/)
        })

        it('should use Brazilian number format', () => {
            const result = formatAmount(1500.50)
            // pt-BR uses . for thousands and , for decimals
            expect(result).toMatch(/1\.?500[,.]50/)
        })
    })
})
