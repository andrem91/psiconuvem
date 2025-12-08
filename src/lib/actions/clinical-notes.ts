'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'
import { encrypt, decrypt } from '@/lib/encryption'
import { revalidatePath } from 'next/cache'

export interface ClinicalNoteDTO {
    id: string
    patientId: string
    sessionDate: string
    sessionNumber: number
    duration: number
    sessionType: string
    content: string // Já descriptografado
    createdAt: string
    updatedAt: string
}

export interface ClinicalNoteSummary {
    id: string
    sessionDate: string
    sessionNumber: number
    sessionType: string
    preview: string // Primeiros 100 chars do conteúdo
}

/**
 * Busca o histórico de notas clínicas de um paciente.
 */
export async function getClinicalNotes(patientId: string): Promise<ClinicalNoteSummary[]> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ClinicalNote')
        .select('id, sessionDate, sessionNumber, sessionType, content')
        .eq('psychologistId', psychologistId)
        .eq('patientId', patientId)
        .is('deletedAt', null)
        .order('sessionDate', { ascending: false })

    if (error) {
        console.error('Erro ao buscar notas:', error)
        return []
    }

    return (data || []).map((note) => {
        let preview = ''
        try {
            const decrypted = decrypt(note.content)
            preview = decrypted.substring(0, 100) + (decrypted.length > 100 ? '...' : '')
        } catch {
            preview = '[Erro ao descriptografar]'
        }

        return {
            id: note.id,
            sessionDate: note.sessionDate,
            sessionNumber: note.sessionNumber,
            sessionType: note.sessionType,
            preview,
        }
    })
}

/**
 * Busca uma nota clínica específica (descriptografada).
 */
export async function getClinicalNoteById(noteId: string): Promise<ClinicalNoteDTO | null> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ClinicalNote')
        .select('*')
        .eq('psychologistId', psychologistId)
        .eq('id', noteId)
        .is('deletedAt', null)
        .single()

    if (error || !data) {
        return null
    }

    let content = ''
    try {
        content = decrypt(data.content)
    } catch {
        content = '[Erro ao descriptografar o conteúdo]'
    }

    return {
        id: data.id,
        patientId: data.patientId,
        sessionDate: data.sessionDate,
        sessionNumber: data.sessionNumber,
        duration: data.duration,
        sessionType: data.sessionType,
        content,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    }
}

/**
 * Calcula o próximo número de sessão para um paciente.
 */
async function getNextSessionNumber(psychologistId: string, patientId: string): Promise<number> {
    const supabase = await createClient()

    const { count } = await supabase
        .from('ClinicalNote')
        .select('*', { count: 'exact', head: true })
        .eq('psychologistId', psychologistId)
        .eq('patientId', patientId)
        .is('deletedAt', null)

    return (count || 0) + 1
}

/**
 * Cria uma nova nota clínica (criptografada).
 */
export async function createClinicalNote(input: {
    patientId: string
    sessionDate: string
    duration: number
    sessionType: string
    content: string
}): Promise<{ success: boolean; noteId?: string; error?: string }> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const sessionNumber = await getNextSessionNumber(psychologistId, input.patientId)
    const encryptedContent = encrypt(input.content)

    const { data, error } = await supabase
        .from('ClinicalNote')
        .insert({
            id: crypto.randomUUID(),
            psychologistId,
            patientId: input.patientId,
            sessionDate: input.sessionDate,
            sessionNumber,
            duration: input.duration,
            sessionType: input.sessionType,
            content: encryptedContent,
            updatedAt: new Date().toISOString(),
        })
        .select('id')
        .single()

    if (error) {
        console.error('Erro ao criar nota:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/pacientes/${input.patientId}/prontuario`)
    return { success: true, noteId: data.id }
}

/**
 * Atualiza uma nota clínica existente (criptografada).
 */
export async function updateClinicalNote(input: {
    noteId: string
    content: string
}): Promise<{ success: boolean; error?: string }> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const encryptedContent = encrypt(input.content)

    const { error } = await supabase
        .from('ClinicalNote')
        .update({
            content: encryptedContent,
            updatedAt: new Date().toISOString(),
        })
        .eq('psychologistId', psychologistId)
        .eq('id', input.noteId)
        .is('deletedAt', null)

    if (error) {
        console.error('Erro ao atualizar nota:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
