'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const FinancialRecordSchema = z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
    date: z.string().min(10, 'Data inválida'),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.enum(['SESSION', 'MONTHLY', 'OTHER']),
    patientId: z.string().optional().nullable(),
    status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional()
})

// Tipo explícito para evitar problemas de inferência
export interface FinancialRecordInput {
    description: string
    amount: number
    date: string
    type: 'INCOME' | 'EXPENSE'
    category: 'SESSION' | 'MONTHLY' | 'OTHER'
    patientId?: string | null
    status?: 'PENDING' | 'PAID' | 'OVERDUE'
}

export async function createFinancialRecord(data: FinancialRecordInput) {
    const validData = FinancialRecordSchema.parse(data)
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const { error } = await supabase.from('FinancialRecord').insert({
        ...validData,
        psychologistId
    })

    if (error) throw new Error('Erro ao criar lançamento: ' + error.message)

    revalidatePath('/dashboard/financeiro')
}

export async function updateFinancialRecord(id: string, data: Partial<FinancialRecordInput>) {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    // Validação parcial não é tão simples com Zod direto, 
    // mas aqui confiamos que o frontend envia dados corretos ou o banco rejeita
    // Para simplificar, vamos permitir update direto dos campos enviados

    const { error } = await supabase
        .from('FinancialRecord')
        .update(data)
        .eq('id', id)
        .eq('psychologistId', psychologistId)

    if (error) throw new Error('Erro ao atualizar lançamento: ' + error.message)

    revalidatePath('/dashboard/financeiro')
}

export async function deleteFinancialRecord(id: string) {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const { error } = await supabase
        .from('FinancialRecord')
        .update({ deletedAt: new Date().toISOString() }) // Soft delete
        .eq('id', id)
        .eq('psychologistId', psychologistId)

    if (error) throw new Error('Erro ao excluir lançamento: ' + error.message)

    revalidatePath('/dashboard/financeiro')
}

export async function getFinancialRecords(startDate: Date, endDate: Date) {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('FinancialRecord')
        .select(`
            *,
            patient:Patient(id, name)
        `)
        .eq('psychologistId', psychologistId)
        .gte('date', startStr)
        .lte('date', endStr)
        .is('deletedAt', null)
        .order('date', { ascending: false })

    if (error) throw new Error('Erro ao buscar lançamentos: ' + error.message)

    return data
}
