/**
 * Testes para a função cn (class name merge utility)
 */
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
    it('should merge single class', () => {
        const result = cn('text-red-500')
        expect(result).toBe('text-red-500')
    })

    it('should merge multiple classes', () => {
        const result = cn('p-4', 'm-2', 'bg-white')
        expect(result).toContain('p-4')
        expect(result).toContain('m-2')
        expect(result).toContain('bg-white')
    })

    it('should handle conflicting tailwind classes', () => {
        // tailwind-merge should keep only the last one
        const result = cn('p-2', 'p-4')
        expect(result).toBe('p-4')
    })

    it('should handle conditional classes', () => {
        const isActive = true
        const isDisabled = false

        const result = cn(
            'base-class',
            isActive && 'active-class',
            isDisabled && 'disabled-class'
        )

        expect(result).toContain('base-class')
        expect(result).toContain('active-class')
        expect(result).not.toContain('disabled-class')
    })

    it('should handle arrays of classes', () => {
        const result = cn(['p-2', 'm-2'], 'text-sm')
        expect(result).toContain('p-2')
        expect(result).toContain('m-2')
        expect(result).toContain('text-sm')
    })

    it('should handle undefined and null', () => {
        const result = cn('base', undefined, null, 'extra')
        expect(result).toContain('base')
        expect(result).toContain('extra')
    })

    it('should handle empty string', () => {
        const result = cn('base', '', 'extra')
        expect(result).toContain('base')
        expect(result).toContain('extra')
    })

    it('should handle object syntax', () => {
        const result = cn({
            'bg-blue-500': true,
            'bg-red-500': false,
            'text-white': true,
        })
        expect(result).toContain('bg-blue-500')
        expect(result).toContain('text-white')
        expect(result).not.toContain('bg-red-500')
    })
})
