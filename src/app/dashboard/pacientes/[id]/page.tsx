import { getPatientById } from '@/lib/actions/patients'
import { getAppointments } from '@/lib/actions/appointments'
import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'
import Link from 'next/link'
import { ArrowLeft, Pencil, Trash2, CalendarPlus, Phone, Mail, Calendar, CreditCard } from 'lucide-react'
import { notFound } from 'next/navigation'
import { PaymentModelBadge } from '@/components/financeiro/PaymentModelBadge'
import { PaymentBadge, PaymentStatus } from '@/components/financeiro/PaymentBadge'
import { DeletePatientButton } from '../_components/delete-button'
import { formatCurrency } from '@/lib/utils/format'
import { formatDate } from '@/lib/utils/date'

type PatientDetailsPageProps = {
    params: Promise<{ id: string }>
}

export default async function PatientDetailsPage({ params }: PatientDetailsPageProps) {
    const { id } = await params
    const patient = await getPatientById(id)

    if (!patient) {
        notFound()
    }

    // Buscar agendamentos do paciente
    const allAppointments = await getAppointments({ patientId: id })
    const recentAppointments = allAppointments.slice(0, 5)

    // Buscar faturas mensais do paciente
    const supabase = await createClient()
    const psychologistId = await getCurrentPsychologistId()

    const { data: invoices } = await supabase
        .from('MonthlyInvoice')
        .select('id, amount, referenceMonth, dueDate, status')
        .eq('patientId', id)
        .eq('psychologistId', psychologistId)
        .is('deletedAt', null)
        .order('referenceMonth', { ascending: false })
        .limit(5)

    // Calcular métricas
    const totalSessions = allAppointments.filter(a => a.status === 'COMPLETED').length
    const thisMonthSessions = allAppointments.filter(a => {
        const apptDate = new Date(a.scheduledAt)
        const now = new Date()
        return apptDate.getMonth() === now.getMonth() &&
            apptDate.getFullYear() === now.getFullYear() &&
            a.status === 'COMPLETED'
    }).length

    // Valor pendente (sessões + faturas)
    const pendingSessions = allAppointments
        .filter(a => a.paymentStatus === 'PENDING' || a.paymentStatus === 'OVERDUE')
        .reduce((sum, a) => sum + (a.sessionPrice || 0), 0)

    const pendingInvoices = (invoices || [])
        .filter(i => i.status === 'PENDING' || i.status === 'OVERDUE')
        .reduce((sum, i) => sum + (i.amount || 0), 0)

    const totalPending = pendingSessions + pendingInvoices

    const lastAppointment = allAppointments.find(a => a.status === 'COMPLETED')

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/pacientes"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar para lista
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                            {patient.paymentModel && (
                                <PaymentModelBadge model={patient.paymentModel as any} />
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {patient.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {patient.phone}
                                </span>
                            )}
                            {patient.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {patient.email}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/dashboard/agenda/novo?paciente=${id}`}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            <CalendarPlus className="w-4 h-4 mr-1" />
                            Agendar
                        </Link>
                        <Link
                            href={`/dashboard/pacientes/${id}/editar`}
                            className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                        >
                            <Pencil className="w-4 h-4 mr-1" />
                            Editar
                        </Link>
                        <DeletePatientButton id={patient.id} name={patient.name} />
                    </div>
                </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <div className="rounded-lg bg-white p-6 shadow">
                    <p className="text-sm font-medium text-gray-500">Total de Sessões</p>
                    <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                    <p className="text-sm font-medium text-gray-500">Sessões este Mês</p>
                    <p className="text-3xl font-bold text-gray-900">{thisMonthSessions}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                    <p className="text-sm font-medium text-gray-500">Valor Pendente</p>
                    <p className={`text-3xl font-bold ${totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(totalPending)}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                    <p className="text-sm font-medium text-gray-500">Última Consulta</p>
                    <p className="text-lg font-semibold text-gray-900">
                        {lastAppointment
                            ? formatDate(lastAppointment.scheduledAt)
                            : 'Nenhuma'}
                    </p>
                </div>
            </div>

            {/* Colunas: Histórico de Consultas e Pagamentos */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Histórico de Consultas */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Consultas Recentes
                        </h2>
                        <Link
                            href={`/dashboard/agenda?paciente=${id}`}
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                            Ver todas
                        </Link>
                    </div>

                    {recentAppointments.length === 0 ? (
                        <p className="text-gray-500 text-sm">Nenhuma consulta encontrada</p>
                    ) : (
                        <div className="space-y-3">
                            {recentAppointments.map((apt) => (
                                <div key={apt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatDate(apt.scheduledAt)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {apt.duration} min • {apt.type === 'online' ? '🖥️ Online' : '🏢 Presencial'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {apt.sessionPrice != null && apt.sessionPrice > 0 && (
                                            <span className="text-sm text-gray-600">
                                                {formatCurrency(apt.sessionPrice)}
                                            </span>
                                        )}
                                        <PaymentBadge status={(apt.paymentStatus || 'PENDING') as PaymentStatus} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Histórico de Pagamentos/Faturas */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Faturas Mensais
                        </h2>
                        <Link
                            href={`/dashboard/financeiro`}
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                            Ver financeiro
                        </Link>
                    </div>

                    {!invoices || invoices.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            {patient.paymentModel === 'MONTHLY_PLAN'
                                ? 'Nenhuma fatura gerada ainda'
                                : 'Paciente não possui plano mensal'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {invoices.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(inv.referenceMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Vence: {formatDate(inv.dueDate)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatCurrency(inv.amount || 0)}
                                        </span>
                                        <PaymentBadge status={(inv.status || 'PENDING') as PaymentStatus} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Informações Adicionais */}
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                        <p className="text-gray-900">
                            {patient.birthdate
                                ? new Date(patient.birthdate).toLocaleDateString('pt-BR')
                                : 'Não informado'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">LGPD</p>
                        <p className="text-gray-900">
                            {patient.lgpdConsent ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    Autorizado
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                    Pendente
                                </span>
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Cadastrado em</p>
                        <p className="text-gray-900">
                            {new Date(patient.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}