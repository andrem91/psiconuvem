import { getAppointments } from '@/lib/actions/appointments'
import { formatDate, formatTime } from '@/lib/utils/date'
import { AppointmentStatusBadge } from '@/components/AppointmentStatusBadge'
import { AppointmentStatus } from '@/lib/validations/appointment'
import Link from 'next/link'

export default async function AgendaPage() {
    // Get all future appointments (today and beyond)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const appointments = await getAppointments({
        startDate: today
    })



    // Count stats
    const scheduled = appointments.filter((a) => a.status === 'SCHEDULED').length
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
                    <p className="text-gray-500">
                        Gerencie seus agendamentos e consultas
                    </p>
                </div>
                <Link
                    href="/dashboard/agenda/novo"
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <svg
                        className="-ml-0.5 mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Novo Agendamento
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">
                                Próximos Agendamentos
                            </p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {appointments.length}
                            </p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3">
                            <svg
                                className="h-6 w-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Pendentes</p>
                            <p className="mt-1 text-3xl font-bold text-blue-600">
                                {scheduled}
                            </p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3">
                            <svg
                                className="h-6 w-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Realizados</p>
                            <p className="mt-1 text-3xl font-bold text-green-600">
                                {completed}
                            </p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3">
                            <svg
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments List */}
            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Próximos Agendamentos
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Exibindo consultas de hoje em diante
                    </p>
                </div>

                <div className="divide-y divide-gray-200">
                    {appointments.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                Nenhum agendamento
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Você não possui agendamentos futuros.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/dashboard/agenda/novo"
                                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    <svg
                                        className="-ml-0.5 mr-2 h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    Criar Primeiro Agendamento
                                </Link>
                            </div>
                        </div>
                    ) : (
                        appointments.map((appointment) => (
                            <div key={appointment.id} className="px-6 py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            {/* Date and Time */}
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(appointment.scheduledAt)}
                                                </span>
                                                <time className="text-sm font-semibold text-gray-900">
                                                    {formatTime(appointment.scheduledAt)}
                                                </time>
                                            </div>
                                            <AppointmentStatusBadge status={appointment.status as AppointmentStatus} />
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            {appointment.patient?.name || 'Paciente sem nome'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {appointment.duration} minutos • {appointment.type}
                                        </p>
                                        {appointment.meetLink && (
                                            <a
                                                href={appointment.meetLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                <svg
                                                    className="mr-1 h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                Iniciar consulta online
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
