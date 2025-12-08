'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { patientSchema } from '@/lib/validations/schemas'
import { getClientIp } from '@/lib/ip'
import crypto from 'crypto'

export type PatientState = {
    errors?: {
        name?: string[]
        email?: string[]
        phone?: string[]
        birthdate?: string[]
        lgpdConsent?: string[]
        _form?: string[]
    }
    values?: {
        name?: string
        email?: string
        phone?: string
        birthdate?: string
        lgpdConsent?: boolean
    }
    success?: boolean
    message?: string
}

// --- QUERIES DE LEITURA (GET) ---

// Listar pacientes do psicólogo logado
export async function getPatients(search?: string) {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    let query = supabase
        .from('Patient')
        .select('*')
        .eq('psychologistId', psychologistId)
        .is('deletedAt', null)
    
    // Filtrar por nome se tiver busca
    if (search && search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`)
    }
    
    const { data, error } = await query.order('name', { ascending: true })
    
    if (error) {
        console.error('Erro ao listar pacientes:', error.message)
        return []
    }
    
    return data || []
}

// Buscar paciente por ID
export async function getPatientById(id: string) {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Patient')
        .select('*')
        .eq('id', id)
        .eq('psychologistId', psychologistId)
        .is('deletedAt', null)
        .single()
    
    if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar paciente:', error.message)
        return null
    }

    return data
}

// --- ACTIONS DE ESCRITA (CREATE, UPDATE, DELETE) ---

// Criar paciente
export async function createPatient(
    prevState: PatientState,
    formData: FormData
): Promise<PatientState> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const rawValues = {
        name: formData.get('name')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        phone: formData.get('phone')?.toString() || '',
        birthdate: formData.get('birthdate')?.toString() || '',
        lgpdConsent: formData.get('lgpdConsent') === 'on',
    }

    const validatedFields = patientSchema.safeParse({
        name: rawValues.name,
        email: rawValues.email || undefined,
        phone: rawValues.phone,
        birthdate: rawValues.birthdate || undefined,
        lgpdConsent: rawValues.lgpdConsent,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            values: rawValues,
        }
    }

    const { name, email, phone, birthdate, lgpdConsent } = validatedFields.data

    // Capturar IP do cliente se houver consentimento LGPD
    const ip = lgpdConsent ? await getClientIp() : null

    try {
        const { error } = await supabase.from('Patient').insert({
            id: crypto.randomUUID(),
            psychologistId,
            name,
            email: email || null,
            phone,
            birthdate: birthdate || null,
            lgpdConsent,
            lgpdConsentDate: lgpdConsent ? new Date().toISOString() : null,
            lgpdConsentIp: ip,
            updatedAt: new Date().toISOString(),
        })

        if (error) throw error

    } catch (error) {
        console.error('Erro ao criar paciente:', error)
        return {
            errors: { _form: ['Erro ao cadastrar paciente. Tente novamente.'] },
        }
    }

    revalidatePath('/dashboard/pacientes')
    redirect('/dashboard/pacientes')
}

// Atualizar paciente
export async function updatePatient(
    id: string,
    prevState: PatientState,
    formData: FormData
): Promise<PatientState> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const existingPatient = await getPatientById(id)

    if (!existingPatient) {
        return {
            errors: { _form: ['Paciente não encontrado ou acesso negado.'] },
        }
    }

    const validatedFields = patientSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email') || undefined,
        phone: formData.get('phone'),
        birthdate: formData.get('birthdate') || undefined,
        lgpdConsent: formData.get('lgpdConsent') === 'on',
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, email, phone, birthdate, lgpdConsent } = validatedFields.data
    
    // Capturar IP do cliente se o consentimento mudou de false para true
    const ip = (lgpdConsent && !existingPatient.lgpdConsent) ? await getClientIp() : null
    
    // Objeto com os dados a atualizar
    const updateData = {
        name,
        email: email || null,
        phone,
        birthdate: birthdate || null,
        lgpdConsent,
        lgpdConsentDate: lgpdConsent && !existingPatient.lgpdConsent 
            ? new Date().toISOString() 
            : existingPatient.lgpdConsentDate,
        lgpdConsentIp: ip || existingPatient.lgpdConsentIp,
        updatedAt: new Date().toISOString(),
    }

    try {
        const { error } = await supabase
            .from('Patient')
            .update(updateData)
            .eq('id', id)
            .eq('psychologistId', psychologistId)
        
        if (error) throw error

    } catch (error) {
        console.error('Erro ao atualizar paciente:', error)
        return {
            errors: { _form: ['Erro ao atualizar paciente. Tente novamente.'] },
        }
    }

    revalidatePath('/dashboard/pacientes')
    revalidatePath(`/dashboard/pacientes/${id}`)
    redirect(`/dashboard/pacientes/${id}`)
}

// Deletar paciente (com cascade para agendamentos e pagamentos)
export async function deletePatient(id: string): Promise<{ success: boolean; error?: string }> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const existingPatient = await getPatientById(id)

    if (!existingPatient) {
        return { success: false, error: 'Paciente não encontrado ou acesso negado' }
    }

    const now = new Date().toISOString()

    try {
        // 1. Cancelar agendamentos FUTUROS (soft-delete)
        // Mantém agendamentos passados para histórico
        const { error: appointmentsError } = await supabase
            .from('Appointment')
            .update({ 
                deletedAt: now,
                status: 'CANCELLED',
                updatedAt: now 
            })
            .eq('patientId', id)
            .eq('psychologistId', psychologistId)
            .gte('scheduledAt', now) // Apenas futuros
            .is('deletedAt', null)

        if (appointmentsError) {
            console.error('Erro ao cancelar agendamentos:', appointmentsError)
        }

        // 2. Cancelar pagamentos PENDENTES de sessões futuras
        // Mantém pagamentos já realizados (histórico contábil)
        const { error: paymentsError } = await supabase
            .from('Appointment')
            .update({ 
                paymentStatus: 'CANCELLED',
                updatedAt: now 
            })
            .eq('patientId', id)
            .eq('psychologistId', psychologistId)
            .in('paymentStatus', ['PENDING', 'OVERDUE'])
            .is('deletedAt', null)

        if (paymentsError) {
            console.error('Erro ao cancelar pagamentos:', paymentsError)
        }

        // 3. Cancelar faturas mensais PENDENTES
        const { error: invoicesError } = await supabase
            .from('MonthlyInvoice')
            .update({ 
                status: 'CANCELLED',
                updatedAt: now 
            })
            .eq('patientId', id)
            .eq('psychologistId', psychologistId)
            .in('status', ['PENDING', 'OVERDUE'])
            .is('deletedAt', null)

        if (invoicesError) {
            console.error('Erro ao cancelar faturas:', invoicesError)
        }

        // 4. Soft-delete do paciente
        const { error } = await supabase
            .from('Patient')
            .update({ deletedAt: now, updatedAt: now })
            .eq('id', id)
            .eq('psychologistId', psychologistId)

        if (error) throw error
        
        revalidatePath('/dashboard/pacientes')
        revalidatePath('/dashboard/agenda')
        revalidatePath('/dashboard/financeiro')
        return { success: true }
    } catch (error) {
        console.error('Erro ao deletar paciente:', error)
        return { success: false, error: 'Erro ao excluir paciente' }
    }
}