'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Gera ou atualiza a fatura mensal para um paciente com plano mensal.
 * Verifica se já existe fatura para o mês antes de criar.
 */
export async function ensureMonthlyInvoice(patientId: string, appointmentDate: Date) {
  const supabase = await createClient()

  // Buscar dados do paciente
  const { data: patient } = await supabase
    .from('Patient')
    .select('paymentModel, monthlyPlanPrice, paymentDueDay, psychologistId')
    .eq('id', patientId)
    .single()

  // Se não for plano mensal ou não tiver dados essenciais, não fazer nada
  if (!patient || patient.paymentModel !== 'MONTHLY_PLAN') {
    return { success: true, message: 'Paciente não é plano mensal' }
  }

  // Garantir que psychologistId existe (type guard)
  const psychologistId = patient.psychologistId
  if (!psychologistId) {
    console.error('Paciente sem psychologistId:', patientId)
    return { success: false, error: 'Paciente sem psychologistId associado' }
  }

  // Calcular mês de referência (sempre dia 1)
  const referenceMonth = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), 1)
  const referenceMonthStr: string = referenceMonth.toISOString().split('T')[0]! // YYYY-MM-DD format

  // Verificar se já existe fatura para este mês
  const { data: existingInvoice } = await supabase
    .from('MonthlyInvoice')
    .select('id')
    .eq('patientId', patientId)
    .eq('referenceMonth', referenceMonthStr)
    .is('deletedAt', null)
    .maybeSingle()

  if (existingInvoice) {
    return { success: true, message: 'Fatura já existe para este mês' }
  }

  // Calcular data de vencimento
  const dueDay = patient.paymentDueDay || 5
  let dueDate = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), dueDay)
  
  // Se o dia de vencimento já passou, usar próximo mês
  if (dueDate < new Date()) {
    dueDate = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth() + 1, dueDay)
  }

  // Criar fatura (usando array com cast para contornar problemas de tipo do RLS)
  const { error } = await supabase
    .from('MonthlyInvoice')
    .insert([{
      psychologistId,  // Agora garantido como string
      patientId,
      referenceMonth: referenceMonthStr,
      amount: patient.monthlyPlanPrice || 600,
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'PENDING',
    }] as any)

  if (error) {
    console.error('Erro ao criar fatura mensal:', error)
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Fatura mensal criada com sucesso' }
}
