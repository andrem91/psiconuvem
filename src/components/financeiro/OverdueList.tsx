import { getOverduePayments } from '@/lib/actions/financial'
import { PaymentBadge } from '@/components/financeiro/PaymentBadge'
import { formatCurrency } from '@/lib/utils/format'
import { formatDate } from '@/lib/utils/date'

function getDaysOverdue(dateString: string): number {
    const due = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - due.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Tipos para os dados de overdue
interface OverdueSession {
    id: string
    scheduledAt: string
    sessionPrice: number | null
    paymentStatus: string
    patient: { id: string; name: string; phone: string | null } | null
}

interface OverdueInvoice {
    id: string
    referenceMonth: string
    dueDate: string
    amount: number | null
    status: string
    patient: { id: string; name: string; phone: string | null } | null
}

export async function OverdueList() {
    const overdueData = await getOverduePayments()
    const totalOverdue = overdueData.total

    if (totalOverdue === 0) {
        return (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                <p className="text-center text-green-700">
                    ✅ Nenhum pagamento atrasado no momento!
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    ⚠️ Pagamentos Atrasados ({totalOverdue})
                </h2>
            </div>

            <div className="space-y-3">
                {/* Sessões Atrasadas */}
                {(overdueData.sessions as OverdueSession[]).map((session) => {
                    const daysOverdue = getDaysOverdue(session.scheduledAt)

                    return (
                        <div
                            key={`session-${session.id}`}
                            className="rounded-lg border border-red-200 bg-red-50 p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {session.patient?.name || 'Paciente'}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Sessão em {formatDate(session.scheduledAt)} · {' '}
                                        <span className="font-medium text-red-600">
                                            {daysOverdue} dias de atraso
                                        </span>
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Contato: {session.patient?.phone || 'Não informado'}
                                    </p>
                                </div>
                                <div className="ml-4 text-right">
                                    <p className="text-lg font-bold text-red-600">
                                        {formatCurrency(session.sessionPrice || 0)}
                                    </p>
                                    <PaymentBadge status="OVERDUE" />
                                </div>
                            </div>
                        </div>
                    )
                })}

                {/* Mensalidades Atrasadas */}
                {(overdueData.invoices as OverdueInvoice[]).map((invoice) => {
                    const daysOverdue = getDaysOverdue(invoice.dueDate)

                    return (
                        <div
                            key={`invoice-${invoice.id}`}
                            className="rounded-lg border border-red-200 bg-red-50 p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {invoice.patient?.name || 'Paciente'}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Mensalidade vence em {formatDate(invoice.dueDate)} · {' '}
                                        <span className="font-medium text-red-600">
                                            {daysOverdue} dias de atraso
                                        </span>
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Contato: {invoice.patient?.phone || 'Não informado'}
                                    </p>
                                </div>
                                <div className="ml-4 text-right">
                                    <p className="text-lg font-bold text-red-600">
                                        {formatCurrency(invoice.amount || 0)}
                                    </p>
                                    <PaymentBadge status="OVERDUE" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
