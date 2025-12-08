/**
 * Testes de integração para Server Actions de agendamentos.
 * Testa a lógica de negócio com Supabase mockado.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAppointment } from '../mocks/supabase'

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

// Variável para controlar respostas do mock
let mockSupabaseResponse: {
    data: unknown
    error: { message: string; code?: string } | null
} = { data: null, error: null }

let mockRpcResponse: {
    data: unknown
    error: { message: string } | null
} = { data: false, error: null }

// Mock do Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn().mockImplementation(async () => ({
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(() => Promise.resolve(mockSupabaseResponse)),
            then: (resolve: (value: unknown) => void) => {
                resolve(mockSupabaseResponse)
                return Promise.resolve(mockSupabaseResponse)
            },
        }),
        rpc: vi.fn().mockImplementation(() => Promise.resolve(mockRpcResponse)),
    })),
}))

describe('Appointments Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabaseResponse = { data: null, error: null }
        mockRpcResponse = { data: false, error: null }
    })

    describe('getAppointments', () => {
        it('should return empty array when no appointments', async () => {
            mockSupabaseResponse = { data: [], error: null }

            const { getAppointments } = await import('@/lib/actions/appointments')
            const result = await getAppointments()

            expect(result).toEqual([])
        })

        it('should return appointments list', async () => {
            mockSupabaseResponse = { data: [mockAppointment], error: null }

            const { getAppointments } = await import('@/lib/actions/appointments')
            const result = await getAppointments()

            expect(result).toHaveLength(1)
            expect(result[0].status).toBe('SCHEDULED')
        })

        it('should apply date filters', async () => {
            mockSupabaseResponse = { data: [mockAppointment], error: null }

            const { getAppointments } = await import('@/lib/actions/appointments')
            const result = await getAppointments({
                startDate: new Date('2024-03-01'),
                endDate: new Date('2024-03-31'),
            })

            expect(result).toHaveLength(1)
        })

        it('should apply status filter', async () => {
            mockSupabaseResponse = { data: [mockAppointment], error: null }

            const { getAppointments } = await import('@/lib/actions/appointments')
            const result = await getAppointments({
                status: ['SCHEDULED', 'COMPLETED'],
            })

            expect(result).toHaveLength(1)
        })
    })

    describe('getAppointmentById', () => {
        it('should return appointment when found', async () => {
            mockSupabaseResponse = { data: mockAppointment, error: null }

            const { getAppointmentById } = await import('@/lib/actions/appointments')
            const result = await getAppointmentById('appointment-123')

            expect(result).not.toBeNull()
            expect(result?.duration).toBe(50)
        })

        it('should return null when not found', async () => {
            mockSupabaseResponse = {
                data: null,
                error: { message: 'Not found', code: 'PGRST116' },
            }

            const { getAppointmentById } = await import('@/lib/actions/appointments')
            const result = await getAppointmentById('nonexistent')

            expect(result).toBeNull()
        })
    })

    describe('createAppointmentSchema validation', () => {
        it('should validate correct appointment data', async () => {
            const { createAppointmentSchema } = await import('@/lib/validations/appointment')

            const futureDate = new Date()
            futureDate.setDate(futureDate.getDate() + 1)

            const result = createAppointmentSchema.safeParse({
                patientId: '550e8400-e29b-41d4-a716-446655440000',
                scheduledAt: futureDate,
                duration: 50,
                type: 'online',
                sessionPrice: 200,
            })

            expect(result.success).toBe(true)
        })

        it('should reject past dates', async () => {
            const { createAppointmentSchema } = await import('@/lib/validations/appointment')

            const pastDate = new Date('2020-01-01T10:00:00')

            const result = createAppointmentSchema.safeParse({
                patientId: '550e8400-e29b-41d4-a716-446655440000',
                scheduledAt: pastDate,
                duration: 50,
                type: 'presencial',
                sessionPrice: 200,
            })

            expect(result.success).toBe(false)
        })

        it('should reject invalid duration', async () => {
            const { createAppointmentSchema } = await import('@/lib/validations/appointment')

            const futureDate = new Date()
            futureDate.setDate(futureDate.getDate() + 1)

            const result = createAppointmentSchema.safeParse({
                patientId: '550e8400-e29b-41d4-a716-446655440000',
                scheduledAt: futureDate,
                duration: 45, // not in VALID_DURATIONS [30, 50, 60, 90]
                type: 'presencial',
                sessionPrice: 200,
            })

            expect(result.success).toBe(false)
        })

        it('should accept valid durations', async () => {
            const { createAppointmentSchema, VALID_DURATIONS } = await import('@/lib/validations/appointment')

            const futureDate = new Date()
            futureDate.setDate(futureDate.getDate() + 1)

            for (const duration of VALID_DURATIONS) {
                const result = createAppointmentSchema.safeParse({
                    patientId: '550e8400-e29b-41d4-a716-446655440000',
                    scheduledAt: futureDate,
                    duration,
                    type: 'presencial',
                    sessionPrice: 200,
                })

                expect(result.success).toBe(true)
            }
        })
    })

    describe('updateAppointmentStatus validation', () => {
        it('should validate status update', async () => {
            const { updateAppointmentStatusSchema, AppointmentStatus } = await import('@/lib/validations/appointment')

            const result = updateAppointmentStatusSchema.safeParse({
                appointmentId: 'appointment-123',
                status: AppointmentStatus.COMPLETED,
            })

            expect(result.success).toBe(true)
        })

        it('should reject invalid status', async () => {
            const { updateAppointmentStatusSchema } = await import('@/lib/validations/appointment')

            const result = updateAppointmentStatusSchema.safeParse({
                appointmentId: 'appointment-123',
                status: 'INVALID_STATUS',
            })

            expect(result.success).toBe(false)
        })
    })
})

describe('AppointmentStatus enum', () => {
    it('should have all required statuses', async () => {
        const { AppointmentStatus } = await import('@/lib/validations/appointment')

        expect(AppointmentStatus.SCHEDULED).toBe('SCHEDULED')
        expect(AppointmentStatus.COMPLETED).toBe('COMPLETED')
        expect(AppointmentStatus.CANCELLED).toBe('CANCELLED')
        expect(AppointmentStatus.NO_SHOW).toBe('NO_SHOW')
    })
})

describe('VALID_DURATIONS', () => {
    it('should include standard session lengths', async () => {
        const { VALID_DURATIONS } = await import('@/lib/validations/appointment')

        expect(VALID_DURATIONS).toContain(30)
        expect(VALID_DURATIONS).toContain(50)
        expect(VALID_DURATIONS).toContain(60)
        expect(VALID_DURATIONS).toContain(90)
    })
})
