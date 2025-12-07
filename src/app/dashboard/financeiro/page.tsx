import { Suspense } from 'react'
import { getFinancialSummary } from '@/lib/actions/financial'
import { getAppointments } from '@/lib/actions/appointments'
import { getCurrentPsychologistId } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { updateOverduePayments } from '@/lib/actions/update-overdue'
import { parseMonthParam } from '@/lib/utils/month'
import { FinancialSummaryCard } from '@/components/FinancialSummaryCard'
import { FinancialTabs } from '@/components/FinancialTabs'
import { OverdueList } from '@/components/OverdueList'
import { MonthSelector } from '@/components/MonthSelector'
import { FinancialActions } from '@/components/FinancialActions'
import type { PaymentStatus } from '@/components/PaymentBadge'

interface PageProps {
    searchParams: Promise<{ month?: string }>
}

export default async function FinanceiroPage({ searchParams }: PageProps) {
    // Atualizar status de pagamentos vencidos automaticamente
    await updateOverduePayments()

    // Parse do mês selecionado
    const params = await searchParams
    const { year, month, startDate, endDate, monthStr } = parseMonthParam(params.month)

    // Buscar resumo financeiro do mês selecionado
    const summary = await getFinancialSummary(startDate)

    // Buscar agendamentos do mês selecionado
    const appointments = await getAppointments({
        startDate,
        endDate,
    })

    // IMPORTANTE: Filtrar pacientes PER_SESSION + mensalistas com sessão avulsa
    const sessions = appointments
        .filter((apt) => {
            // Incluir se: é por sessão OU é mensalista mas marcou cobrança avulsa
            const isPerSession = !apt.patient?.paymentModel || apt.patient?.paymentModel === 'PER_SESSION'
            const isBillableSession = isPerSession || apt.billAsSession === true
            return apt.sessionPrice != null && apt.sessionPrice > 0 && isBillableSession
        })
        .map((apt) => ({
            id: apt.id,
            patientName: apt.patient?.name || 'Sem nome',
            date: apt.scheduledAt,
            amount: apt.sessionPrice || 0,
            status: (apt.paymentStatus || 'PENDING') as PaymentStatus,
        }))

    // Buscar faturas mensais do mês selecionado
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const referenceMonth = `${year}-${String(month).padStart(2, '0')}-01`

    const { data: monthlyInvoicesData } = await supabase
        .from('MonthlyInvoice')
        .select(`
      id,
      amount,
      dueDate,
      status,
      patient:Patient(id, name)
    `)
        .eq('psychologistId', psychologistId)
        .eq('referenceMonth', referenceMonth)
        .is('deletedAt', null)
        .order('dueDate', { ascending: true })

    interface MonthlyInvoiceData {
        id: string
        amount: number | null
        dueDate: string
        status: string | null
        patient: { id: string; name: string } | null
    }

    const invoices = (monthlyInvoicesData || []).map((inv: MonthlyInvoiceData) => ({
        id: inv.id,
        patientName: inv.patient?.name || 'Sem nome',
        month: new Date(referenceMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        dueDate: inv.dueDate,
        amount: inv.amount || 0,
        status: inv.status as PaymentStatus,
    }))

    // Buscar lançamentos manuais (FinancialRecord)
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    const { data: manualRecordsData } = await supabase
        .from('FinancialRecord')
        .select(`
            id, description, amount, date, type, category, status,
            patient:Patient(id, name)
        `)
        .eq('psychologistId', psychologistId)
        .gte('date', startStr)
        .lte('date', endStr)
        .is('deletedAt', null)
        .order('date', { ascending: false })

    interface FinancialRecordData {
        id: string
        description: string
        amount: number
        date: string
        type: string
        category: string
        status: string
        patient: { id: string; name: string } | null
    }

    const manualRecords = (manualRecordsData || []).map((rec: FinancialRecordData) => ({
        id: rec.id,
        description: rec.description,
        amount: rec.amount,
        date: rec.date,
        type: rec.type as 'INCOME' | 'EXPENSE',
        category: rec.category,
        status: rec.status,
        patientName: rec.patient?.name || '-'
    }))

    return (
        <div className="space-y-6">
            {/* Header com Navegação de Mês */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
                    <p className="mt-1 text-gray-600">
                        Controle de recebimentos e pagamentos
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Suspense fallback={<div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />}>
                        <MonthSelector defaultMonth={monthStr} />
                    </Suspense>
                    <FinancialActions />
                </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Sessões Avulsas */}
                <FinancialSummaryCard
                    title="Sessões - Recebido"
                    amount={summary.sessionsReceived}
                    variant="success"
                    icon={<span className="text-2xl">✓</span>}
                />
                <FinancialSummaryCard
                    title="Sessões - Pendente"
                    amount={summary.sessionsPending}
                    variant="warning"
                    icon={<span className="text-2xl">⏳</span>}
                />

                {/* Mensalidades */}
                <FinancialSummaryCard
                    title="Mensalidades - Recebido"
                    amount={summary.monthlyPlansReceived}
                    variant="success"
                    icon={<span className="text-2xl">📅</span>}
                />
                <FinancialSummaryCard
                    title="Mensalidades - Pendente"
                    amount={summary.monthlyPlansPending}
                    variant="warning"
                    icon={<span className="text-2xl">📋</span>}
                />
            </div>

            {/* Totais */}
            <div className="grid gap-4 sm:grid-cols-3">
                <FinancialSummaryCard
                    title="Total Recebido"
                    amount={summary.totalReceived}
                    variant="success"
                    icon={<span className="text-2xl">💰</span>}
                />
                <FinancialSummaryCard
                    title="Total Pendente"
                    amount={summary.totalPending}
                    variant="warning"
                    icon={<span className="text-2xl">⏱</span>}
                />
                <FinancialSummaryCard
                    title="Total Atrasado"
                    amount={summary.totalOverdue}
                    variant="danger"
                    icon={<span className="text-2xl">⚠</span>}
                />
            </div>

            {/* Lista de Devedores */}
            <div className="rounded-lg bg-white p-6 shadow">
                <OverdueList />
            </div>

            {/* Abas com Tabelas */}
            <div className="rounded-lg bg-white p-6 shadow">
                <FinancialTabs sessions={sessions} invoices={invoices} manualRecords={manualRecords} />
            </div>
        </div>
    )
}
