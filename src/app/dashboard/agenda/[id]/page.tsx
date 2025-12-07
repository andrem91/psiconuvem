import { getAppointmentById } from '@/lib/actions/appointments'
import Link from 'next/link'
import { ArrowLeft, Pencil, Calendar, Clock, User, Video, MapPin, Copy, Check, X, DollarSign } from 'lucide-react'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils/format'
import { formatDate } from '@/lib/utils/date'
import { PaymentBadge, PaymentStatus } from '@/components/PaymentBadge'
import { AppointmentStatusActions } from './_components/AppointmentStatusActions'
import { CopyMeetLinkButton } from './_components/CopyMeetLinkButton'

type AppointmentDetailsPageProps = {
    params: Promise<{ id: string }>
}

// Status badges with colors
function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        'SCHEDULED': { label: '📅 Agendado', className: 'bg-blue-100 text-blue-800' },
        'COMPLETED': { label: '✅ Concluído', className: 'bg-green-100 text-green-800' },
        'CANCELLED': { label: '❌ Cancelado', className: 'bg-gray-100 text-gray-600' },
        'NO_SHOW': { label: '⚠️ Não compareceu', className: 'bg-yellow-100 text-yellow-800' },
    }

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
            {config.label}
        </span>
    )
}

export default async function AppointmentDetailsPage({ params }: AppointmentDetailsPageProps) {
    const { id } = await params
    const appointment = await getAppointmentById(id)

    if (!appointment) {
        notFound()
    }

    const scheduledDate = new Date(appointment.scheduledAt)
    const endTime = new Date(scheduledDate.getTime() + appointment.duration * 60000)

    const isOnline = appointment.type === 'online'
    const canEdit = appointment.status === 'SCHEDULED'
    const canMarkPaid = appointment.paymentStatus === 'PENDING' || appointment.paymentStatus === 'OVERDUE'

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/agenda"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar para agenda
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Consulta com {appointment.patient?.name || 'Paciente'}
                            </h1>
                            <StatusBadge status={appointment.status} />
                        </div>
                        <p className="text-gray-500">
                            {formatDate(appointment.scheduledAt)} às {scheduledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {/* Ações Rápidas */}
                    {canEdit && (
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/dashboard/agenda/${id}/editar`}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                <Pencil className="w-4 h-4 mr-1" />
                                Editar
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Coluna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Informações do Agendamento */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Informações da Consulta
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Data</p>
                                    <p className="text-gray-900">{formatDate(appointment.scheduledAt)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Horário</p>
                                    <p className="text-gray-900">
                                        {scheduledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        {' - '}
                                        {endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        {' '}({appointment.duration} min)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                {isOnline ? (
                                    <Video className="w-5 h-5 text-gray-400 mt-0.5" />
                                ) : (
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                                    <p className="text-gray-900">
                                        {isOnline ? '🖥️ Online (Telepsicologia)' : '🏢 Presencial'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Paciente</p>
                                    <Link
                                        href={`/dashboard/pacientes/${appointment.patient?.id}`}
                                        className="text-indigo-600 hover:text-indigo-500"
                                    >
                                        {appointment.patient?.name}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Link do Meet */}
                        {isOnline && appointment.meetLink && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-800 mb-2">🔗 Link da Reunião</p>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={appointment.meetLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm truncate flex-1"
                                    >
                                        {appointment.meetLink}
                                    </a>
                                    <CopyMeetLinkButton link={appointment.meetLink} />
                                </div>
                            </div>
                        )}

                        {/* Notas */}
                        {appointment.notes && (
                            <div className="mt-6">
                                <p className="text-sm font-medium text-gray-500 mb-2">Observações</p>
                                <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                                    {appointment.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Informações Financeiras */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Informações Financeiras
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Valor da Sessão</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {appointment.sessionPrice != null && appointment.sessionPrice > 0
                                        ? formatCurrency(appointment.sessionPrice)
                                        : 'Plano Mensal'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Status do Pagamento</p>
                                <div className="mt-1">
                                    <PaymentBadge status={(appointment.paymentStatus || 'PENDING') as PaymentStatus} />
                                </div>
                            </div>

                            {appointment.paymentDate && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Data do Pagamento</p>
                                    <p className="text-gray-900">{formatDate(appointment.paymentDate)}</p>
                                </div>
                            )}

                            {appointment.paymentMethod && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Método</p>
                                    <p className="text-gray-900">{appointment.paymentMethod}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Coluna Lateral - Ações */}
                <div className="space-y-6">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Ações
                        </h2>
                        <AppointmentStatusActions
                            appointmentId={id}
                            currentStatus={appointment.status}
                            paymentStatus={appointment.paymentStatus || 'PENDING'}
                            sessionPrice={appointment.sessionPrice}
                        />
                    </div>

                    {/* Info do Paciente */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Contato do Paciente
                        </h2>
                        {appointment.patient?.phone && (
                            <p className="text-sm text-gray-600 mb-2">
                                📞 {appointment.patient.phone}
                            </p>
                        )}
                        {appointment.patient?.email && (
                            <p className="text-sm text-gray-600 mb-4">
                                ✉️ {appointment.patient.email}
                            </p>
                        )}
                        <Link
                            href={`/dashboard/pacientes/${appointment.patient?.id}`}
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                            Ver perfil completo →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
