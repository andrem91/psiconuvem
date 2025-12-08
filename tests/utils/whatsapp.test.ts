import { describe, it, expect } from 'vitest'
import { generateWhatsAppMessage } from '@/lib/utils/whatsapp'
import type { PatientDebtorDTO } from '@/lib/actions/financial-context'

describe('whatsapp utilities', () => {
    describe('generateWhatsAppMessage', () => {
        const mockDebtor: PatientDebtorDTO = {
            patientId: '123',
            patientName: 'João Silva',
            patientPhone: '11999998888',
            status: 'OVERDUE',
            totalDebt: 350,
            overdueCount: 2,
            pendingCount: 0,
            items: [
                {
                    id: '1',
                    type: 'SESSION',
                    date: '2024-01-10T10:00:00Z',
                    amount: 200,
                    status: 'OVERDUE',
                },
                {
                    id: '2',
                    type: 'MONTHLY',
                    date: '2024-01-15T10:00:00Z',
                    amount: 150,
                    status: 'PENDING',
                },
            ],
        }

        it('should include patient name', () => {
            const result = generateWhatsAppMessage(mockDebtor)
            const decoded = decodeURIComponent(result)
            expect(decoded).toContain('João Silva')
        })

        it('should include total debt', () => {
            const result = generateWhatsAppMessage(mockDebtor)
            const decoded = decodeURIComponent(result)
            expect(decoded).toContain('350.00')
        })

        it('should include session items', () => {
            const result = generateWhatsAppMessage(mockDebtor)
            const decoded = decodeURIComponent(result)
            expect(decoded).toContain('Sessão')
            expect(decoded).toContain('200.00')
        })

        it('should include monthly fee items', () => {
            const result = generateWhatsAppMessage(mockDebtor)
            const decoded = decodeURIComponent(result)
            expect(decoded).toContain('Mensalidade')
            expect(decoded).toContain('150.00')
        })

        it('should be URL encoded', () => {
            const result = generateWhatsAppMessage(mockDebtor)
            // Should contain encoded characters
            expect(result).toContain('%')
            // Should not contain raw newlines
            expect(result).not.toContain('\n')
        })

        it('should include greeting emoji', () => {
            const result = generateWhatsAppMessage(mockDebtor)
            const decoded = decodeURIComponent(result)
            expect(decoded).toContain('😊')
        })

        it('should format dates in pt-BR', () => {
            const result = generateWhatsAppMessage(mockDebtor)
            const decoded = decodeURIComponent(result)
            // Should contain formatted date (DD/MM/YYYY)
            expect(decoded).toMatch(/\d{2}\/\d{2}\/\d{4}/)
        })
    })
})
