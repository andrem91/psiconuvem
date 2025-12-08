import {
    getFinancialHealthMetrics,
    getDebtorsList,
    PatientDebtorDTO,
} from '@/lib/actions/financial-context'
import { generateWhatsAppMessage } from '@/lib/utils/whatsapp'
import { formatCurrency } from '@/lib/utils/format'
import { formatDate } from '@/lib/utils/date'
import Link from 'next/link'
import {
    DollarSign,
    TrendingUp,
    AlertTriangle,
    MessageCircle,
    ChevronRight,
    Calendar,
    CreditCard,
} from 'lucide-react'

export default async function FinanceiroPage() {
    const [metrics, debtors] = await Promise.all([
        getFinancialHealthMetrics(),
        getDebtorsList(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
                <p className="mt-1 text-gray-600">
                    Controle de recebimentos e pendências
                </p>
            </div>

            {/* Health Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <HealthCard
                    title="A Receber (Mês)"
                    value={metrics.toReceive}
                    icon={<TrendingUp className="h-5 w-5" />}
                    variant="default"
                />
                <HealthCard
                    title="Recebido (Mês)"
                    value={metrics.received}
                    icon={<DollarSign className="h-5 w-5" />}
                    variant="success"
                />
                <HealthCard
                    title="Em Atraso (Total)"
                    value={metrics.overdue}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    variant={metrics.overdue > 0 ? 'danger' : 'success'}
                />
            </div>

            {/* Debtors List */}
            <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        👥 Pacientes com Pendências
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Ordenado por prioridade: atrasados primeiro
                    </p>
                </div>

                {debtors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <DollarSign className="mb-3 h-12 w-12 text-emerald-400" />
                        <p className="text-lg font-medium text-gray-900">
                            Tudo em dia! 🎉
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Nenhum pagamento pendente no momento.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {debtors.map((debtor) => (
                            <DebtorRow key={debtor.patientId} debtor={debtor} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Helper Components ---

interface HealthCardProps {
    title: string
    value: number
    icon: React.ReactNode
    variant: 'default' | 'success' | 'danger'
}

function HealthCard({ title, value, icon, variant }: HealthCardProps) {
    const variants = {
        default: 'bg-white border-gray-200',
        success: 'bg-emerald-50 border-emerald-200',
        danger: 'bg-red-50 border-red-200',
    }
    const iconVariants = {
        default: 'bg-gray-100 text-gray-600',
        success: 'bg-emerald-100 text-emerald-600',
        danger: 'bg-red-100 text-red-600',
    }
    const valueVariants = {
        default: 'text-gray-900',
        success: 'text-emerald-700',
        danger: 'text-red-700',
    }

    return (
        <div className={`rounded-xl border p-5 ${variants[variant]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`mt-1 text-2xl font-bold ${valueVariants[variant]}`}>
                        {formatCurrency(value)}
                    </p>
                </div>
                <div className={`rounded-full p-3 ${iconVariants[variant]}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

interface DebtorRowProps {
    debtor: PatientDebtorDTO
}

function DebtorRow({ debtor }: DebtorRowProps) {
    const isOverdue = debtor.status === 'OVERDUE'
    const whatsappUrl = debtor.patientPhone
        ? `https://wa.me/55${debtor.patientPhone.replace(/\D/g, '')}?text=${generateWhatsAppMessage(debtor)}`
        : null

    return (
        <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ${isOverdue
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                        }`}
                >
                    {debtor.patientName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{debtor.patientName}</p>
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isOverdue
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                                }`}
                        >
                            {isOverdue ? '🔴 Atrasado' : '🟡 Pendente'}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        {debtor.items.length} {debtor.items.length === 1 ? 'item' : 'itens'}{' '}
                        ({debtor.overdueCount > 0 && `${debtor.overdueCount} atrasado`}
                        {debtor.overdueCount > 0 && debtor.pendingCount > 0 && ', '}
                        {debtor.pendingCount > 0 && `${debtor.pendingCount} pendente`})
                    </p>
                </div>
            </div>

            {/* Value & Actions */}
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p
                        className={`text-lg font-bold ${isOverdue ? 'text-red-600' : 'text-yellow-600'
                            }`}
                    >
                        {formatCurrency(debtor.totalDebt)}
                    </p>
                    <p className="text-xs text-gray-500">total em aberto</p>
                </div>

                {/* WhatsApp Button */}
                {whatsappUrl && (
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                        title="Cobrar via WhatsApp"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Cobrar</span>
                    </a>
                )}

                {/* Details Link */}
                <Link
                    href={`/dashboard/pacientes/${debtor.patientId}`}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <ChevronRight className="h-5 w-5" />
                </Link>
            </div>
        </div>
    )
}
