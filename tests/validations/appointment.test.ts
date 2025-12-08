/**
 * Testes para validações de agendamento
 */
import { describe, it, expect } from 'vitest'
import {
    createAppointmentSchema,
    updateAppointmentStatusSchema,
    filterAppointmentsSchema,
    AppointmentStatus,
    AppointmentType,
    VALID_DURATIONS,
} from '@/lib/validations/appointment'

describe('Appointment Validations', () => {
    describe('createAppointmentSchema', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 7)

        const validData = {
            patientId: '550e8400-e29b-41d4-a716-446655440000',
            scheduledAt: futureDate,
            duration: 50,
            type: 'presencial' as const,
            sessionPrice: 200,
        }

        it('should validate complete valid data', () => {
            const result = createAppointmentSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should validate with notes', () => {
            const result = createAppointmentSchema.safeParse({
                ...validData,
                notes: 'Primeira sessão do paciente',
            })
            expect(result.success).toBe(true)
        })

        it('should validate online type', () => {
            const result = createAppointmentSchema.safeParse({
                ...validData,
                type: 'online',
            })
            expect(result.success).toBe(true)
        })

        it('should reject invalid patientId format', () => {
            const result = createAppointmentSchema.safeParse({
                ...validData,
                patientId: 'not-a-uuid',
            })
            expect(result.success).toBe(false)
        })

        it('should reject negative session price', () => {
            const result = createAppointmentSchema.safeParse({
                ...validData,
                sessionPrice: -50,
            })
            expect(result.success).toBe(false)
        })

        it('should accept zero session price', () => {
            const result = createAppointmentSchema.safeParse({
                ...validData,
                sessionPrice: 0,
            })
            expect(result.success).toBe(true)
        })

        it('should reject notes too long', () => {
            const result = createAppointmentSchema.safeParse({
                ...validData,
                notes: 'A'.repeat(5001),
            })
            expect(result.success).toBe(false)
        })

        it('should validate telepsyConsent boolean', () => {
            const result = createAppointmentSchema.safeParse({
                ...validData,
                telepsyConsent: true,
            })
            expect(result.success).toBe(true)
        })

        it('should validate billAsSession boolean', () => {
            const result = createAppointmentSchema.safeParse({
                ...validData,
                billAsSession: true,
            })
            expect(result.success).toBe(true)
        })
    })

    describe('updateAppointmentStatusSchema', () => {
        it('should validate SCHEDULED status', () => {
            const result = updateAppointmentStatusSchema.safeParse({
                appointmentId: 'test-id',
                status: AppointmentStatus.SCHEDULED,
            })
            expect(result.success).toBe(true)
        })

        it('should validate COMPLETED status', () => {
            const result = updateAppointmentStatusSchema.safeParse({
                appointmentId: 'test-id',
                status: AppointmentStatus.COMPLETED,
            })
            expect(result.success).toBe(true)
        })

        it('should validate CANCELLED status', () => {
            const result = updateAppointmentStatusSchema.safeParse({
                appointmentId: 'test-id',
                status: AppointmentStatus.CANCELLED,
            })
            expect(result.success).toBe(true)
        })

        it('should validate NO_SHOW status', () => {
            const result = updateAppointmentStatusSchema.safeParse({
                appointmentId: 'test-id',
                status: AppointmentStatus.NO_SHOW,
            })
            expect(result.success).toBe(true)
        })

        it('should reject empty appointmentId', () => {
            const result = updateAppointmentStatusSchema.safeParse({
                appointmentId: '',
                status: AppointmentStatus.COMPLETED,
            })
            expect(result.success).toBe(false)
        })
    })

    describe('filterAppointmentsSchema', () => {
        it('should accept empty filters', () => {
            const result = filterAppointmentsSchema.safeParse({})
            expect(result.success).toBe(true)
        })

        it('should accept date range', () => {
            const result = filterAppointmentsSchema.safeParse({
                startDate: new Date(),
                endDate: new Date(),
            })
            expect(result.success).toBe(true)
        })

        it('should accept status array', () => {
            const result = filterAppointmentsSchema.safeParse({
                status: [AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED],
            })
            expect(result.success).toBe(true)
        })

        it('should accept patientId filter', () => {
            const result = filterAppointmentsSchema.safeParse({
                patientId: 'patient-123',
            })
            expect(result.success).toBe(true)
        })
    })

    describe('AppointmentType enum', () => {
        it('should have presencial type', () => {
            expect(AppointmentType.PRESENCIAL).toBe('presencial')
        })

        it('should have online type', () => {
            expect(AppointmentType.ONLINE).toBe('online')
        })
    })

    describe('VALID_DURATIONS constant', () => {
        it('should have expected number of durations', () => {
            expect(VALID_DURATIONS).toHaveLength(4)
        })

        it('should contain standard session lengths', () => {
            expect(VALID_DURATIONS).toContain(30)
            expect(VALID_DURATIONS).toContain(50)
            expect(VALID_DURATIONS).toContain(60)
            expect(VALID_DURATIONS).toContain(90)
        })
    })
})
