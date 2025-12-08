'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

// ============================================
// TYPES
// ============================================

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type PaymentMethod =
  | 'CASH'
  | 'PIX'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
export type PaymentModel = 'PER_SESSION' | 'MONTHLY_PLAN'

export type FinancialSummary = {
  // Sessões avulsas
  sessionsReceived: number
  sessionsPending: number
  sessionsOverdue: number

  // Mensalidades
  monthlyPlansReceived: number
  monthlyPlansPending: number
  monthlyPlansOverdue: number

  // Totais
  totalReceived: number
  totalPending: number
  totalOverdue: number
  monthRevenue: number
}

export type PatientPaymentConfig = {
  paymentModel: PaymentModel
  monthlyPlanPrice?: number
  paymentDueDay?: number
  sessionsPerMonth?: number
  planStartDate?: string
}

// ============================================
// CONFIGURAR MODELO DE PAGAMENTO DO PACIENTE
// ============================================

/**
 * Define o modelo de cobrança para um paciente específico.
 * Pode ser por sessão (avulso) ou plano mensal.
 */
export async function setPatientPaymentModel(
  patientId: string,
  config: PatientPaymentConfig,
) {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const updateData: any = {
    paymentModel: config.paymentModel,
    updatedAt: new Date().toISOString(),
  }

  if (config.paymentModel === 'MONTHLY_PLAN') {
    if (!config.monthlyPlanPrice) {
      return {
        success: false,
        error: 'Valor da mensalidade é obrigatório para plano mensal',
      }
    }

    updateData.monthlyPlanPrice = config.monthlyPlanPrice
    updateData.paymentDueDay = config.paymentDueDay
    updateData.sessionsPerMonth = config.sessionsPerMonth || 4
    updateData.planStartDate = config.planStartDate || null
  } else {
    // Limpar campos de plano mensal se mudar para por sessão
    updateData.monthlyPlanPrice = null
    updateData.paymentDueDay = null
    updateData.sessionsPerMonth = null
    updateData.planStartDate = null
  }

  const { error } = await supabase
    .from('Patient')
    .update(updateData)
    .eq('id', patientId)
    .eq('psychologistId', psychologistId)

  if (error) {
    console.error('Erro ao configurar modelo de pagamento:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/pacientes')
  revalidatePath(`/dashboard/pacientes/${patientId}`)
  return { success: true }
}

// ============================================
// GERAR FATURAS MENSAIS
// ============================================

/**
 * Gera faturas mensais para todos os pacientes com plano mensal.
 * Deve ser executada no início de cada mês.
 */
export async function generateMonthlyInvoices(month?: Date) {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const targetMonth = month || new Date()

  // Buscar pacientes com plano mensal
  const { data: patients, error: patientsError } = await supabase
    .from('Patient')
    .select('id, name, monthlyPlanPrice, paymentDueDay')
    .eq('psychologistId', psychologistId)
    .eq('paymentModel', 'MONTHLY_PLAN')
    .is('deletedAt', null)

  if (patientsError) {
    console.error('Erro ao buscar pacientes:', patientsError)
    return { success: false, error: patientsError.message }
  }

  if (!patients || patients.length === 0) {
    return { success: true, count: 0, message: 'Nenhum paciente com plano mensal' }
  }

  // Primeiro dia do mês de referência
  const referenceMonth = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    1,
  )

  // Gerar faturas
  const invoices = patients
    .filter((patient) => patient.monthlyPlanPrice != null) // Apenas com preço definido
    .map((patient) => {
      const dueDay = patient.paymentDueDay || 5
      const dueDate = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth(),
        dueDay,
      )

      return {
        psychologistId,
        patientId: patient.id,
        referenceMonth: referenceMonth.toISOString().split('T')[0]!,
        amount: patient.monthlyPlanPrice!,
        dueDate: dueDate.toISOString().split('T')[0]!,
        status: 'PENDING' as const,
      }
    })

  if (invoices.length === 0) {
    return { success: true, count: 0, message: 'Nenhuma fatura gerada (pacientes sem preço definido)' }
  }

  const { error } = await supabase.from('MonthlyInvoice').upsert(invoices, {
    onConflict: 'patientId,referenceMonth',
    ignoreDuplicates: false,
  })

  if (error) {
    console.error('Erro ao gerar faturas:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/financeiro')
  return {
    success: true,
    count: invoices.length,
    message: `${invoices.length} fatura(s) gerada(s) com sucesso`,
  }
}

// ============================================
// MARCAR SESSÃO COMO PAGA
// ============================================

/**
 * Marca uma sessão individual como paga.
 */
export async function markSessionAsPaid(
  appointmentId: string,
  paymentData: {
    paymentMethod: PaymentMethod
    paymentNotes?: string
  },
) {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('Appointment')
    .update({
      paymentStatus: 'PAID',
      paymentDate: new Date().toISOString(),
      paymentMethod: paymentData.paymentMethod,
      paymentNotes: paymentData.paymentNotes || null,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', appointmentId)
    .eq('psychologistId', psychologistId)

  if (error) {
    console.error('Erro ao marcar sessão como paga:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/financeiro')
  revalidatePath('/dashboard/agenda')
  return { success: true, message: 'Pagamento registrado com sucesso' }
}

// ============================================
// MARCAR MENSALIDADE COMO PAGA
// ============================================

/**
 * Marca uma fatura mensal como paga.
 */
export async function markMonthlyInvoiceAsPaid(
  invoiceId: string,
  paymentData: {
    paymentMethod: PaymentMethod
    notes?: string
  },
) {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('MonthlyInvoice')
    .update({
      status: 'PAID',
      paidAt: new Date().toISOString(),
      paymentMethod: paymentData.paymentMethod,
      notes: paymentData.notes || null,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', invoiceId)
    .eq('psychologistId', psychologistId)

  if (error) {
    console.error('Erro ao marcar mensalidade como paga:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/financeiro')
  return { success: true, message: 'Mensalidade registrada como paga' }
}

// ============================================
// RESUMO FINANCEIRO
// ============================================

/**
 * Retorna resumo financeiro do mês atual ou especificado.
 */
export async function getFinancialSummary(
  month?: Date,
): Promise<FinancialSummary> {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const targetMonth = month || new Date()
  const startOfMonth = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    1,
  )
  const endOfMonth = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
    23,
    59,
    59,
  )

  // Buscar sessões do mês
  const { data: sessions } = await supabase
    .from('Appointment')
    .select('paymentStatus, sessionPrice')
    .eq('psychologistId', psychologistId)
    .is('deletedAt', null)
    .gte('scheduledAt', startOfMonth.toISOString())
    .lte('scheduledAt', endOfMonth.toISOString())

  // Buscar faturas mensais do mês
  const referenceMonth = startOfMonth.toISOString().split('T')[0] as string
  const { data: invoices } = await supabase
    .from('MonthlyInvoice')
    .select('status, amount')
    .eq('psychologistId', psychologistId)
    .eq('referenceMonth', referenceMonth)
    .is('deletedAt', null)

  // Calcular sessões
  const sessionsSummary = (sessions || []).reduce(
    (acc, session) => {
      const price = session.sessionPrice || 0

      switch (session.paymentStatus) {
        case 'PAID':
          acc.sessionsReceived += price
          break
        case 'PENDING':
          acc.sessionsPending += price
          break
        case 'OVERDUE':
          acc.sessionsOverdue += price
          break
      }

      return acc
    },
    {
      sessionsReceived: 0,
      sessionsPending: 0,
      sessionsOverdue: 0,
    },
  )

  // Calcular mensalidades
  const invoicesSummary = (invoices || []).reduce(
    (acc, invoice) => {
      const amount = invoice.amount || 0

      switch (invoice.status) {
        case 'PAID':
          acc.monthlyPlansReceived += amount
          break
        case 'PENDING':
          acc.monthlyPlansPending += amount
          break
        case 'OVERDUE':
          acc.monthlyPlansOverdue += amount
          break
      }

      return acc
    },
    {
      monthlyPlansReceived: 0,
      monthlyPlansPending: 0,
      monthlyPlansOverdue: 0,
    },
  )

  const totalReceived =
    sessionsSummary.sessionsReceived + invoicesSummary.monthlyPlansReceived
  const totalPending =
    sessionsSummary.sessionsPending + invoicesSummary.monthlyPlansPending
  const totalOverdue =
    sessionsSummary.sessionsOverdue + invoicesSummary.monthlyPlansOverdue

  return {
    ...sessionsSummary,
    ...invoicesSummary,
    totalReceived,
    totalPending,
    totalOverdue,
    monthRevenue: totalReceived,
  }
}

// ============================================
// LISTAR DEVEDORES
// ============================================

/**
 * Retorna lista de pagamentos atrasados (sessões + mensalidades).
 */
export async function getOverduePayments() {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  // Buscar sessões atrasadas
  const { data: sessions } = await supabase
    .from('Appointment')
    .select(
      `
      id,
      scheduledAt,
      sessionPrice,
      paymentStatus,
      patient:Patient(id, name, phone)
    `,
    )
    .eq('psychologistId', psychologistId)
    .eq('paymentStatus', 'OVERDUE')
    .is('deletedAt', null)
    .order('scheduledAt', { ascending: true })

  // Buscar mensalidades atrasadas
  const { data: invoices } = await supabase
    .from('MonthlyInvoice')
    .select(
      `
      id,
      referenceMonth,
      dueDate,
      amount,
      status,
      patient:Patient(id, name, phone)
    `,
    )
    .eq('psychologistId', psychologistId)
    .eq('status', 'OVERDUE')
    .is('deletedAt', null)
    .order('dueDate', { ascending: true })

  return {
    sessions: sessions || [],
    invoices: invoices || [],
    total: (sessions?.length || 0) + (invoices?.length || 0),
  }
}

// ============================================
// CONFIGURAÇÕES FINANCEIRAS
// ============================================

/**
 * Busca ou cria configurações financeiras do psicólogo.
 */
export async function getFinancialSettings() {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('FinancialSettings')
    .select('*')
    .eq('psychologistId', psychologistId)
    .single()

  if (error && error.code === 'PGRST116') {
    // Não existe, criar padrão
    const { data: newSettings, error: createError } = await supabase
      .from('FinancialSettings')
      .insert({
        psychologistId,
        defaultSessionPrice: 150.0,
        defaultMonthlyPrice: 600.0,
        defaultPaymentDueDay: 5,
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar configurações:', createError)
      return null
    }

    return newSettings
  }

  if (error) {
    console.error('Erro ao buscar configurações:', error)
    return null
  }

  return data
}

/**
 * Atualiza configurações financeiras do psicólogo.
 */
export async function updateFinancialSettings(settings: {
  defaultSessionPrice?: number
  defaultMonthlyPrice?: number
  defaultPaymentDueDay?: number
  acceptedPaymentMethods?: string[]
}) {
  const psychologistId = await getCurrentPsychologistId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('FinancialSettings')
    .update({
      ...settings,
      updatedAt: new Date().toISOString(),
    })
    .eq('psychologistId', psychologistId)

  if (error) {
    console.error('Erro ao atualizar configurações:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/financeiro/configuracoes')
  return { success: true, message: 'Configurações atualizadas' }
}
