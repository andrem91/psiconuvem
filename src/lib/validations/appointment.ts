import { z } from 'zod'

// Appointment Status Enum (matching database)
export const AppointmentStatus = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus]

// Appointment Type
export const AppointmentType = {
  PRESENCIAL: 'presencial',
  ONLINE: 'online',
} as const

export type AppointmentType =
  (typeof AppointmentType)[keyof typeof AppointmentType]

// Valid durations in minutes
export const VALID_DURATIONS = [30, 50, 60, 90] as const

// Create Appointment Schema
export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('Paciente inválido'),
  scheduledAt: z.coerce
    .date()
    .refine((date) => {
      // Add 5-minute tolerance to prevent validation failures
      // if user takes time to fill the form
      const now = new Date()
      now.setMinutes(now.getMinutes() - 5) // 5 min tolerance
      return date > now
    }, 'Data/hora deve ser no futuro (com pelo menos 5 minutos de antecedência)'),
  duration: z
    .number()
    .refine(
      (val) => VALID_DURATIONS.includes(val as (typeof VALID_DURATIONS)[number]),
      `Duração deve ser uma das opções: ${VALID_DURATIONS.join(', ')} minutos`
    ),
  type: z.nativeEnum(AppointmentType),
  notes: z.string().max(5000, 'Observações muito longas').optional(),
  telepsyConsent: z.boolean().default(false),
  sessionPrice: z.coerce.number().nonnegative('Valor deve ser maior ou igual a zero'),
  billAsSession: z.boolean().default(false),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>

// Update Appointment Status Schema
export const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().min(1),
  status: z.enum([
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ]),
})

export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>

// Filter Appointments Schema
export const filterAppointmentsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z
    .array(
      z.enum([
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ]),
    )
    .optional(),
  patientId: z.string().optional(),
})

export type FilterAppointmentsInput = z.infer<typeof filterAppointmentsSchema>
