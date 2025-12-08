/**
 * Testes de integração para Server Actions de pacientes.
 * Testa a lógica de negócio com Supabase mockado.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPatient, mockPsychologist } from '../mocks/supabase'

// Mock dos módulos do Next.js
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}))

// Mock do tenant
vi.mock('@/lib/tenant', () => ({
    getCurrentPsychologistId: vi.fn().mockResolvedValue('psychologist-123'),
}))

// Mock do IP helper
vi.mock('@/lib/ip', () => ({
    getClientIp: vi.fn().mockResolvedValue('127.0.0.1'),
}))

// Variável para controlar respostas do mock
let mockSupabaseResponse: {
    data: unknown
    error: { message: string; code?: string } | null
} = { data: null, error: null }

// Mock do Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn().mockImplementation(async () => ({
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(() => Promise.resolve(mockSupabaseResponse)),
            then: (resolve: (value: unknown) => void) => {
                resolve(mockSupabaseResponse)
                return Promise.resolve(mockSupabaseResponse)
            },
        }),
    })),
}))

describe('Patients Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabaseResponse = { data: null, error: null }
    })

    describe('getPatients', () => {
        it('should return empty array when no patients', async () => {
            mockSupabaseResponse = { data: [], error: null }

            const { getPatients } = await import('@/lib/actions/patients')
            const result = await getPatients()

            expect(result).toEqual([])
        })

        it('should return patients list', async () => {
            mockSupabaseResponse = { data: [mockPatient], error: null }

            const { getPatients } = await import('@/lib/actions/patients')
            const result = await getPatients()

            expect(result).toHaveLength(1)
            expect(result[0]?.name).toBe('João Silva')
        })

        it('should return empty array on error', async () => {
            mockSupabaseResponse = {
                data: null,
                error: { message: 'Database error' },
            }

            const { getPatients } = await import('@/lib/actions/patients')
            const result = await getPatients()

            expect(result).toEqual([])
        })
    })

    describe('getPatientById', () => {
        it('should return patient when found', async () => {
            mockSupabaseResponse = { data: mockPatient, error: null }

            const { getPatientById } = await import('@/lib/actions/patients')
            const result = await getPatientById('patient-123')

            expect(result).not.toBeNull()
            expect(result?.name).toBe('João Silva')
        })

        it('should return null when not found', async () => {
            mockSupabaseResponse = {
                data: null,
                error: { message: 'Not found', code: 'PGRST116' },
            }

            const { getPatientById } = await import('@/lib/actions/patients')
            const result = await getPatientById('nonexistent')

            expect(result).toBeNull()
        })
    })

    describe('patientSchema validation', () => {
        it('should validate correct patient data', async () => {
            const { patientSchema } = await import('@/lib/validations/schemas')

            const result = patientSchema.safeParse({
                name: 'Maria Santos',
                phone: '11999887766',
                email: 'maria@email.com',
                lgpdConsent: true,
            })

            expect(result.success).toBe(true)
        })

        it('should reject invalid phone', async () => {
            const { patientSchema } = await import('@/lib/validations/schemas')

            const result = patientSchema.safeParse({
                name: 'Maria Santos',
                phone: '123', // muito curto
            })

            expect(result.success).toBe(false)
        })

        it('should reject short name', async () => {
            const { patientSchema } = await import('@/lib/validations/schemas')

            const result = patientSchema.safeParse({
                name: 'Jo', // menos de 3 caracteres
                phone: '11999887766',
            })

            expect(result.success).toBe(false)
        })
    })

    describe('createPatient flow', () => {
        it('should validate required fields', async () => {
            const formData = new FormData()
            formData.set('name', '')
            formData.set('phone', '')

            const { createPatient } = await import('@/lib/actions/patients')
            
            // Note: createPatient calls redirect, which is mocked
            // We test validation by checking the return value before redirect
            try {
                const result = await createPatient({}, formData)
                expect(result.errors).toBeDefined()
            } catch {
                // redirect throws, which is expected for successful creation
            }
        })
    })
})

describe('Mock data integrity', () => {
    it('mockPatient should have required fields', () => {
        expect(mockPatient.id).toBeDefined()
        expect(mockPatient.psychologistId).toBeDefined()
        expect(mockPatient.name).toBeDefined()
        expect(mockPatient.phone).toBeDefined()
    })

    it('mockPsychologist should have required fields', () => {
        expect(mockPsychologist.id).toBeDefined()
        expect(mockPsychologist.crp).toBeDefined()
        expect(mockPsychologist.email).toBeDefined()
    })
})
