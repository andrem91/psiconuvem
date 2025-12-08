'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'

export interface PatientDebtorDTO {
    patientId: string
    patientName: string
    patientPhone: string | null
    status: 'OVERDUE' | 'PENDING' | 'PAID'
    totalDebt: number
    overdueCount: number
    pendingCount: number
    items: {
        id: string
        type: 'SESSION' | 'MONTHLY'
        date: string
        amount: number
        status: string
    }[]
}

export interface FinancialHealthMetrics {
    toReceive: number // Previsão do mês (agendamentos + mensalidades)
    received: number // O que já entrou
    overdue: number // Soma total de dívidas vencidas
}

/**
 * Busca métricas de saúde financeira do mês atual.
 */
export async function getFinancialHealthMetrics(): Promise<FinancialHealthMetrics> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0]

    // Sessões do mês
    const { data: sessions } = await supabase
        .from('Appointment')
        .select('sessionPrice, paymentStatus')
        .eq('psychologistId', psychologistId)
        .gte('scheduledAt', firstDayStr)
        .is('deletedAt', null)

    let received = 0
    let toReceive = 0

    sessions?.forEach((s) => {
        const price = s.sessionPrice || 0
        toReceive += price
        if (s.paymentStatus === 'PAID') received += price
    })

    // Mensalidades do mês
    const referenceMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
    const { data: invoices } = await supabase
        .from('MonthlyInvoice')
        .select('amount, status')
        .eq('psychologistId', psychologistId)
        .eq('referenceMonth', referenceMonth)
        .is('deletedAt', null)

    invoices?.forEach((inv) => {
        const amount = inv.amount || 0
        toReceive += amount
        if (inv.status === 'PAID') received += amount
    })

    // Total em atraso (todos os tempos, não só do mês)
    const { data: overdueSessions } = await supabase
        .from('Appointment')
        .select('sessionPrice')
        .eq('psychologistId', psychologistId)
        .eq('paymentStatus', 'OVERDUE')
        .is('deletedAt', null)

    const { data: overdueInvoices } = await supabase
        .from('MonthlyInvoice')
        .select('amount')
        .eq('psychologistId', psychologistId)
        .eq('status', 'OVERDUE')
        .is('deletedAt', null)

    let overdue = 0
    overdueSessions?.forEach((s) => (overdue += s.sessionPrice || 0))
    overdueInvoices?.forEach((inv) => (overdue += inv.amount || 0))

    return { toReceive, received, overdue }
}

/**
 * Busca lista de pacientes com pendências financeiras, agrupados e ordenados por status.
 */
export async function getDebtorsList(): Promise<PatientDebtorDTO[]> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    // Buscar sessões não pagas
    const { data: unpaidSessions } = await supabase
        .from('Appointment')
        .select(`
            id, scheduledAt, sessionPrice, paymentStatus,
            patient:Patient(id, name, phone)
        `)
        .eq('psychologistId', psychologistId)
        .in('paymentStatus', ['PENDING', 'OVERDUE'])
        .is('deletedAt', null)
        .not('sessionPrice', 'is', null)
        .order('scheduledAt', { ascending: false })

    // Buscar mensalidades não pagas
    const { data: unpaidInvoices } = await supabase
        .from('MonthlyInvoice')
        .select(`
            id, dueDate, amount, status,
            patient:Patient(id, name, phone)
        `)
        .eq('psychologistId', psychologistId)
        .in('status', ['PENDING', 'OVERDUE'])
        .is('deletedAt', null)
        .order('dueDate', { ascending: false })

    // Agrupar por paciente
    const patientMap = new Map<string, PatientDebtorDTO>()

    // Processar sessões
    unpaidSessions?.forEach((session) => {
        const patient = session.patient as { id: string; name: string; phone: string | null } | null
        if (!patient) return

        if (!patientMap.has(patient.id)) {
            patientMap.set(patient.id, {
                patientId: patient.id,
                patientName: patient.name,
                patientPhone: patient.phone,
                status: 'PENDING',
                totalDebt: 0,
                overdueCount: 0,
                pendingCount: 0,
                items: [],
            })
        }

        const dto = patientMap.get(patient.id)!
        const amount = session.sessionPrice || 0
        const paymentStatus = session.paymentStatus || 'PENDING'
        dto.totalDebt += amount
        dto.items.push({
            id: session.id,
            type: 'SESSION',
            date: session.scheduledAt,
            amount,
            status: paymentStatus,
        })

        if (paymentStatus === 'OVERDUE') {
            dto.overdueCount++
            dto.status = 'OVERDUE'
        } else {
            dto.pendingCount++
        }
    })

    // Processar mensalidades
    unpaidInvoices?.forEach((invoice) => {
        const patient = invoice.patient as { id: string; name: string; phone: string | null } | null
        if (!patient) return

        if (!patientMap.has(patient.id)) {
            patientMap.set(patient.id, {
                patientId: patient.id,
                patientName: patient.name,
                patientPhone: patient.phone,
                status: 'PENDING',
                totalDebt: 0,
                overdueCount: 0,
                pendingCount: 0,
                items: [],
            })
        }

        const dto = patientMap.get(patient.id)!
        const amount = invoice.amount || 0
        const invoiceStatus = invoice.status || 'PENDING'
        dto.totalDebt += amount
        dto.items.push({
            id: invoice.id,
            type: 'MONTHLY',
            date: invoice.dueDate,
            amount,
            status: invoiceStatus,
        })

        if (invoiceStatus === 'OVERDUE') {
            dto.overdueCount++
            dto.status = 'OVERDUE'
        } else {
            dto.pendingCount++
        }
    })

    // Ordenar: Atrasados primeiro, depois por valor
    const result = Array.from(patientMap.values())
    result.sort((a, b) => {
        if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1
        if (a.status !== 'OVERDUE' && b.status === 'OVERDUE') return 1
        return b.totalDebt - a.totalDebt
    })

    return result
}
