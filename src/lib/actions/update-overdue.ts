'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

/**
 * Verifica e atualiza status de pagamentos vencidos para OVERDUE.
 * Deve ser chamada periodicamente ou no load da página financeiro.
 */
export async function updateOverduePayments() {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]!

  // Atualizar sessões vencidas (agendamentos passados ainda PENDING)
  const { error: sessionsError, count: sessionsCount } = await supabase
    .from('Appointment')
    .update({
      paymentStatus: 'OVERDUE',
      updatedAt: new Date().toISOString(),
    })
    .eq('psychologistId', psychologistId)
    .eq('paymentStatus', 'PENDING')
    .lt('scheduledAt', today)
    .is('deletedAt', null)

  if (sessionsError) {
    console.error('Erro ao atualizar sessões vencidas:', sessionsError)
  }

  // Atualizar mensalidades vencidas
  const { error: invoicesError, count: invoicesCount } = await supabase
    .from('MonthlyInvoice')
    .update({
      status: 'OVERDUE',
      updatedAt: new Date().toISOString(),
    })
    .eq('psychologistId', psychologistId)
    .eq('status', 'PENDING')
    .lt('dueDate', today)
    .is('deletedAt', null)

  if (invoicesError) {
    console.error('Erro ao atualizar mensalidades vencidas:', invoicesError)
  }

  const totalUpdated = (sessionsCount || 0) + (invoicesCount || 0)

  if (totalUpdated > 0) {
    revalidatePath('/dashboard/financeiro')
  }

  return {
    success: true,
    sessionsUpdated: sessionsCount || 0,
    invoicesUpdated: invoicesCount || 0,
    message: `${totalUpdated} pagamento(s) marcado(s) como atrasado(s)`,
  }
}
