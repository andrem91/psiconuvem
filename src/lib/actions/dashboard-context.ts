'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'

export interface DashboardOverview {
    todaysAppointments: {
        id: string
        scheduledAt: string
        status: string
        duration: number
        type: string
        meetLink: string | null
        paymentStatus: string | null
        patient: { id: string; name: string } | null
    }[]
    financialHealth: {
        received: number
        pending: number
        overdue: number
    }
    pendingActions: {
        overduePaymentsCount: number
        inactivePatients: number
    }
    stats: {
        totalPatients: number
        activePatients: number
        appointmentsThisMonth: number
    }
}

/**
 * Busca todos os dados necessários para o Dashboard Unificado em uma única chamada.
 */
export async function getDashboardOverview(): Promise<DashboardOverview> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    // Datas de referência
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString()

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0]

    // 1. Agendamentos de hoje
    const { data: todaysAppointments } = await supabase
        .from('Appointment')
        .select(`
            id, scheduledAt, status, duration, type, meetLink, paymentStatus,
            patient:Patient(id, name)
        `)
        .eq('psychologistId', psychologistId)
        .gte('scheduledAt', todayStr)
        .lt('scheduledAt', tomorrowStr)
        .is('deletedAt', null)
        .order('scheduledAt', { ascending: true })

    // 2. Saúde Financeira do Mês
    const { data: sessionsData } = await supabase
        .from('Appointment')
        .select('sessionPrice, paymentStatus')
        .eq('psychologistId', psychologistId)
        .gte('scheduledAt', firstDayStr)
        .is('deletedAt', null)

    let received = 0
    let pending = 0
    let overdue = 0

    sessionsData?.forEach((s) => {
        const price = s.sessionPrice || 0
        if (s.paymentStatus === 'PAID') received += price
        else if (s.paymentStatus === 'OVERDUE') overdue += price
        else if (s.paymentStatus === 'PENDING') pending += price
    })

    // 3. Contagem de Ações Pendentes
    const { count: overduePaymentsCount } = await supabase
        .from('Appointment')
        .select('*', { count: 'exact', head: true })
        .eq('psychologistId', psychologistId)
        .eq('paymentStatus', 'OVERDUE')
        .is('deletedAt', null)

    const { count: inactivePatients } = await supabase
        .from('Patient')
        .select('*', { count: 'exact', head: true })
        .eq('psychologistId', psychologistId)
        .eq('status', 'INACTIVE')
        .is('deletedAt', null)

    // 4. Estatísticas Gerais
    const { count: totalPatients } = await supabase
        .from('Patient')
        .select('*', { count: 'exact', head: true })
        .eq('psychologistId', psychologistId)
        .is('deletedAt', null)

    const { count: activePatients } = await supabase
        .from('Patient')
        .select('*', { count: 'exact', head: true })
        .eq('psychologistId', psychologistId)
        .eq('status', 'ACTIVE')
        .is('deletedAt', null)

    const { count: appointmentsThisMonth } = await supabase
        .from('Appointment')
        .select('*', { count: 'exact', head: true })
        .eq('psychologistId', psychologistId)
        .gte('scheduledAt', firstDayStr)
        .is('deletedAt', null)

    return {
        todaysAppointments: (todaysAppointments || []) as DashboardOverview['todaysAppointments'],
        financialHealth: {
            received,
            pending,
            overdue,
        },
        pendingActions: {
            overduePaymentsCount: overduePaymentsCount || 0,
            inactivePatients: inactivePatients || 0,
        },
        stats: {
            totalPatients: totalPatients || 0,
            activePatients: activePatients || 0,
            appointmentsThisMonth: appointmentsThisMonth || 0,
        },
    }
}
