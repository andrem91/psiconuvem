import { getDashboardOverview } from '@/lib/actions/dashboard-context'
import { formatCurrency } from '@/lib/utils/format'
import { formatTime } from '@/lib/utils/date'
import { AppointmentStatusBadge } from '@/components/AppointmentStatusBadge'
import { PaymentBadge } from '@/components/financeiro/PaymentBadge'
import Link from 'next/link'
import {
    Calendar,
    Users,
    DollarSign,
    AlertTriangle,
    Clock,
    Video,
    ChevronRight,
} from 'lucide-react'

export default async function DashboardPage() {
    const overview = await getDashboardOverview()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-gray-600">
                    Visão geral do seu consultório
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Pacientes Ativos"
                    value={overview.stats.activePatients}
                    subtext={`de ${overview.stats.totalPatients} total`}
                    icon={<Users className="h-5 w-5" />}
                    variant="default"
                />
                <StatCard
                    title="Recebido (Mês)"
                    value={formatCurrency(overview.financialHealth.received)}
                    subtext={`${formatCurrency(overview.financialHealth.pending)} pendente`}
                    icon={<DollarSign className="h-5 w-5" />}
                    variant="success"
                />
                <StatCard
                    title="Em Atraso"
                    value={formatCurrency(overview.financialHealth.overdue)}
                    subtext={`${overview.pendingActions.overduePaymentsCount} pagamentos`}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    variant={overview.financialHealth.overdue > 0 ? 'danger' : 'default'}
                />
                <StatCard
                    title="Consultas (Mês)"
                    value={overview.stats.appointmentsThisMonth}
                    subtext="agendamentos"
                    icon={<Calendar className="h-5 w-5" />}
                    variant="default"
                />
            </div>

            {/* Action Center & Today's Timeline */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Action Center (Alerts) */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-1">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        ⚡ Ações Pendentes
                    </h2>
                    <div className="space-y-3">
                        {overview.pendingActions.overduePaymentsCount > 0 && (
                            <ActionCard
                                icon={<DollarSign className="h-4 w-4 text-red-600" />}
                                title={`${overview.pendingActions.overduePaymentsCount} pagamentos atrasados`}
                                description="Cobrar pacientes"
                                href="/dashboard/financeiro"
                                variant="danger"
                            />
                        )}
                        {overview.pendingActions.inactivePatients > 0 && (
                            <ActionCard
                                icon={<Users className="h-4 w-4 text-yellow-600" />}
                                title={`${overview.pendingActions.inactivePatients} pacientes inativos`}
                                description="Recuperar relacionamento"
                                href="/dashboard/pacientes?status=INACTIVE"
                                variant="warning"
                            />
                        )}
                        {overview.pendingActions.overduePaymentsCount === 0 &&
                            overview.pendingActions.inactivePatients === 0 && (
                                <p className="py-4 text-center text-sm text-gray-500">
                                    ✅ Tudo em dia!
                                </p>
                            )}
                    </div>
                </div>

                {/* Today's Timeline */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            📅 Agenda de Hoje
                        </h2>
                        <Link
                            href="/dashboard/agenda"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            Ver completa →
                        </Link>
                    </div>

                    {overview.todaysAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Calendar className="mb-2 h-10 w-10 text-gray-300" />
                            <p className="text-sm text-gray-500">
                                Nenhuma consulta agendada para hoje.
                            </p>
                            <Link
                                href="/dashboard/agenda/novo"
                                className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                                + Agendar consulta
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {overview.todaysAppointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center rounded-lg bg-gray-100 px-3 py-2">
                                            <Clock className="h-4 w-4 text-gray-600" />
                                            <span className="mt-1 text-sm font-semibold text-gray-900">
                                                {formatTime(apt.scheduledAt)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {apt.patient?.name || 'Paciente'}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>{apt.duration} min</span>
                                                <span>•</span>
                                                <span>{apt.type}</span>
                                                {apt.meetLink && (
                                                    <>
                                                        <span>•</span>
                                                        <Video className="h-3 w-3" />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AppointmentStatusBadge status={apt.status as any} />
                                        {apt.paymentStatus && (
                                            <PaymentBadge status={apt.paymentStatus as any} />
                                        )}
                                        <Link
                                            href={`/dashboard/agenda/${apt.id}`}
                                            className="ml-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- Helper Components ---

interface StatCardProps {
    title: string
    value: string | number
    subtext: string
    icon: React.ReactNode
    variant: 'default' | 'success' | 'danger'
}

function StatCard({ title, value, subtext, icon, variant }: StatCardProps) {
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
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{subtext}</p>
                </div>
                <div className={`rounded-full p-3 ${iconVariants[variant]}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

interface ActionCardProps {
    icon: React.ReactNode
    title: string
    description: string
    href: string
    variant: 'danger' | 'warning'
}

function ActionCard({ icon, title, description, href, variant }: ActionCardProps) {
    const variants = {
        danger: 'border-red-200 bg-red-50 hover:bg-red-100',
        warning: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
    }

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${variants[variant]}`}
        >
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-600">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>
    )
}
