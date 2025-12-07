'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  filterAppointmentsSchema,
  AppointmentStatus,
  AppointmentType,
} from '@/lib/validations/appointment'
import crypto from 'crypto'

export type AppointmentState = {
  errors?: {
    patientId?: string[]
    scheduledAt?: string[]
    duration?: string[]
    type?: string[]
    notes?: string[]
    sessionPrice?: string[]
    _form?: string[]
  }
  success?: boolean
  message?: string
}

// --- HELPERS ---

// Generate Google Meet link
function generateMeetLink(): string {
  // Generate random code: xxx-xxxx-xxx
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const randomChar = () => chars[Math.floor(Math.random() * chars.length)]

  const part1 = Array.from({ length: 3 }, randomChar).join('')
  const part2 = Array.from({ length: 4 }, randomChar).join('')
  const part3 = Array.from({ length: 3 }, randomChar).join('')

  return `https://meet.google.com/${part1}-${part2}-${part3}`
}

/**
 * Check for appointment conflicts using database function (efficient)
 * Uses Postgres function to avoid fetching all appointments to client
 */
async function hasConflict(
  psychologistId: string,
  scheduledAt: Date,
  duration: number,
  excludeId?: string,
): Promise<boolean> {
  const supabase = await createClient()

  // Call Postgres function for efficient conflict checking
  const { data, error } = await supabase.rpc('check_appointment_conflict', {
    p_psychologist_id: psychologistId,
    p_scheduled_at: scheduledAt.toISOString(),
    p_duration: duration,
    p_exclude_id: excludeId || undefined,
  })

  if (error) {
    console.error('Erro ao verificar conflitos:', error)
    return false
  }

  return data as boolean
}

// --- QUERIES DE LEITURA (GET) ---

// Get appointments with filters
export async function getAppointments(
  filters?: {
    startDate?: Date
    endDate?: Date
    status?: AppointmentStatus[]
    patientId?: string
  },
) {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  let query = supabase
    .from('Appointment')
    .select(
      `
      *,
      patient:Patient (
        id,
        name,
        phone,
        email,
        paymentModel
      )
    `,
    )
    .eq('psychologistId', psychologistId)
    .is('deletedAt', null) // Exclude soft-deleted appointments

  // Apply filters
  if (filters?.startDate) {
    query = query.gte('scheduledAt', filters.startDate.toISOString())
  }

  if (filters?.endDate) {
    query = query.lte('scheduledAt', filters.endDate.toISOString())
  }

  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }

  if (filters?.patientId) {
    query = query.eq('patientId', filters.patientId)
  }

  const { data, error } = await query.order('scheduledAt', { ascending: true })

  if (error) {
    console.error('Erro ao listar agendamentos:', error.message)
    return []
  }

  return data || []
}

// Get appointments for a specific day
export async function getAppointmentsByDate(date: Date) {
  // Create new Date objects to avoid mutating the input
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return getAppointments({
    startDate: startOfDay,
    endDate: endOfDay,
  })
}

// Get appointments for a specific week
export async function getAppointmentsByWeek(date: Date) {
  const dayOfWeek = date.getDay()
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - dayOfWeek)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return getAppointments({
    startDate: startOfWeek,
    endDate: endOfWeek,
  })
}

// Get appointment by ID
export async function getAppointmentById(id: string) {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Appointment')
    .select(
      `
      *,
      patient:Patient (
        id,
        name,
        phone,
        email
      )
    `,
    )
    .eq('id', id)
    .eq('psychologistId', psychologistId)
    .is('deletedAt', null) // Exclude soft-deleted
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar agendamento:', error.message)
    return null
  }

  return data
}

// --- ACTIONS DE ESCRITA (CREATE, UPDATE, DELETE) ---

// Create appointment
export async function createAppointment(
  prevState: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const validatedFields = createAppointmentSchema.safeParse({
    patientId: formData.get('patientId'),
    scheduledAt: formData.get('scheduledAt'),
    duration: Number(formData.get('duration')),
    type: formData.get('type') || 'presencial',
    notes: formData.get('notes') || undefined,
    telepsyConsent: formData.get('telepsyConsent') === 'on',
    sessionPrice: parseFloat(formData.get('sessionPrice') as string) || 0,
    billAsSession: formData.get('billAsSession') === 'on',
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { patientId, scheduledAt, duration, type, notes, telepsyConsent, sessionPrice, billAsSession } =
    validatedFields.data

  // Check for conflicts
  const conflict = await hasConflict(psychologistId, scheduledAt, duration)

  if (conflict) {
    return {
      errors: {
        _form: [
          'Já existe um agendamento neste horário. Escolha outro horário.',
        ],
      },
    }
  }

  // Generate meet link if online
  const meetLink = type === AppointmentType.ONLINE ? generateMeetLink() : null

  try {
    // Important: We use toISOString() for database storage, but the Date object
    // already contains the correct local time from the form input
    // The database will store it in UTC, but when we read it back,
    // JavaScript will automatically convert to local timezone
    const { error } = await supabase.from('Appointment').insert({
      id: crypto.randomUUID(),
      psychologistId,
      patientId,
      scheduledAt: scheduledAt.toISOString(),
      duration,
      status: AppointmentStatus.SCHEDULED,
      type,
      meetLink,
      notes: notes || null,
      telepsyConsent,
      sessionPrice,
      billAsSession,
      paymentStatus: 'PENDING',
      updatedAt: new Date().toISOString(),
    })

    if (error) throw error

    // REMOVIDO: Geração automática de fatura mensal
    // Agora faturas são geradas manualmente pelo psicólogo
    // const { ensureMonthlyInvoice } = await import('./monthly-invoice-helper')
    // await ensureMonthlyInvoice(patientId, scheduledAt)
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return {
      errors: { _form: ['Erro ao criar agendamento. Tente novamente.'] },
    }
  }

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/financeiro')
  redirect('/dashboard/agenda')
}

// Update appointment status
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<{ success: boolean; error?: string }> {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  // Validate
  const validated = updateAppointmentStatusSchema.safeParse({
    appointmentId,
    status,
  })

  if (!validated.success) {
    return { success: false, error: 'Dados inválidos' }
  }

  // Check if appointment exists
  const existing = await getAppointmentById(appointmentId)

  if (!existing) {
    return { success: false, error: 'Agendamento não encontrado' }
  }

  try {
    const { error } = await supabase
      .from('Appointment')
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .eq('psychologistId', psychologistId)

    if (error) throw error

    revalidatePath('/dashboard/agenda')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return { success: false, error: 'Erro ao atualizar status' }
  }
}

// Update appointment (reschedule)
export async function updateAppointment(
  id: string,
  prevState: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const existing = await getAppointmentById(id)

  if (!existing) {
    return {
      errors: { _form: ['Agendamento não encontrado ou acesso negado.'] },
    }
  }

  const validatedFields = createAppointmentSchema.safeParse({
    patientId: formData.get('patientId'),
    scheduledAt: formData.get('scheduledAt'),
    duration: Number(formData.get('duration')),
    type: formData.get('type') || 'presencial',
    notes: formData.get('notes') || undefined,
    telepsyConsent: formData.get('telepsyConsent') === 'on',
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { patientId, scheduledAt, duration, type, notes, telepsyConsent } =
    validatedFields.data

  // Check for conflicts (excluding current appointment)
  const conflict = await hasConflict(psychologistId, scheduledAt, duration, id)

  if (conflict) {
    return {
      errors: {
        _form: [
          'Já existe um agendamento neste horário. Escolha outro horário.',
        ],
      },
    }
  }

  // Generate meet link if changing to online and doesn't have one
  let meetLink = existing.meetLink
  if (type === AppointmentType.ONLINE && !meetLink) {
    meetLink = generateMeetLink()
  } else if (type === AppointmentType.PRESENCIAL) {
    meetLink = null
  }

  try {
    const { error } = await supabase
      .from('Appointment')
      .update({
        patientId,
        scheduledAt: scheduledAt.toISOString(),
        duration,
        type,
        meetLink,
        notes: notes || null,
        telepsyConsent,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('psychologistId', psychologistId)

    if (error) throw error
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return {
      errors: { _form: ['Erro ao atualizar agendamento. Tente novamente.'] },
    }
  }

  revalidatePath('/dashboard/agenda')
  revalidatePath(`/dashboard/agenda/${id}`)
  redirect(`/dashboard/agenda/${id}`)
}

// Delete appointment (soft delete)
export async function deleteAppointment(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const existing = await getAppointmentById(id)

  if (!existing) {
    return { success: false, error: 'Agendamento não encontrado' }
  }

  try {
    // Soft delete: set deletedAt timestamp
    const { error } = await supabase
      .from('Appointment')
      .update({
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('psychologistId', psychologistId)

    if (error) throw error

    revalidatePath('/dashboard/agenda')
    return { success: true }
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error)
    return { success: false, error: 'Erro ao cancelar agendamento' }
  }
}
