import { getAppointments } from '@/lib/actions/appointments'
import { parseDateParam, formatDateParam } from '@/lib/utils/time-grid'
import { DayTimeline } from '@/components/agenda/DayTimeline'
import { AppointmentBlock } from '@/components/agenda/AppointmentBlock'
import { DateNavigator } from '@/components/agenda/DateNavigator'
import Link from 'next/link'
import { Plus, Calendar } from 'lucide-react'

interface PageProps {
    searchParams: Promise<{ date?: string }>
}

export default async function AgendaPage({ searchParams }: PageProps) {
    const params = await searchParams
    const selectedDate = parseDateParam(params.date)

    // Buscar agendamentos do dia selecionado
    const startDate = new Date(selectedDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(selectedDate)
    endDate.setHours(23, 59, 59, 999)

    const appointments = await getAppointments({
        startDate,
        endDate,
    })

    // Contar estatísticas do dia
    const scheduled = appointments.filter((a) => a.status === 'SCHEDULED').length
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
                    <p className="mt-1 text-gray-600">
                        Visualização do dia
                    </p>
                </div>
                <Link
                    href="/dashboard/agenda/novo"
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Agendamento
                </Link>
            </div>

            {/* Date Navigator */}
            <DateNavigator selectedDate={selectedDate} />

            {/* Stats Row */}
            <div className="flex gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-blue-900">
                        {scheduled} agendado{scheduled !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-900">
                        {completed} realizado{completed !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Day Timeline */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Calendar className="mb-3 h-12 w-12 text-gray-300" />
                        <p className="text-lg font-medium text-gray-900">
                            Nenhum agendamento
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Este dia está livre.
                        </p>
                        <Link
                            href="/dashboard/agenda/novo"
                            className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Criar agendamento
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
                        <DayTimeline selectedDate={selectedDate}>
                            {appointments.map((apt) => (
                                <AppointmentBlock
                                    key={apt.id}
                                    id={apt.id}
                                    scheduledAt={apt.scheduledAt}
                                    duration={apt.duration}
                                    status={apt.status}
                                    type={apt.type}
                                    meetLink={apt.meetLink || null}
                                    patient={apt.patient as { id: string; name: string } | null}
                                    paymentStatus={apt.paymentStatus || null}
                                />
                            ))}
                        </DayTimeline>
                    </div>
                )}
            </div>
        </div>
    )
}
