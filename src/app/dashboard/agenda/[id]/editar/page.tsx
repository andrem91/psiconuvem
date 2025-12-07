import { getAppointmentById } from '@/lib/actions/appointments'
import { getPatients } from '@/lib/actions/patients'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { EditAppointmentForm } from './_components/EditAppointmentForm'

type EditAppointmentPageProps = {
    params: Promise<{ id: string }>
}

export default async function EditAppointmentPage({ params }: EditAppointmentPageProps) {
    const { id } = await params
    const appointment = await getAppointmentById(id)
    const patients = await getPatients()

    if (!appointment) {
        notFound()
    }

    // Check if appointment can be edited
    if (appointment.status !== 'SCHEDULED') {
        return (
            <div>
                <Link
                    href={`/dashboard/agenda/${id}`}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar para detalhes
                </Link>
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6 text-center">
                    <p className="text-yellow-800">
                        ⚠️ Este agendamento não pode ser editado pois seu status é "{appointment.status}".
                    </p>
                    <p className="text-sm text-yellow-600 mt-2">
                        Apenas agendamentos com status "Agendado" podem ser editados.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link
                    href={`/dashboard/agenda/${id}`}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar para detalhes
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Editar Agendamento</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Consulta com {appointment.patient?.name}
                </p>
            </div>

            {/* Formulário */}
            <div className="max-w-2xl">
                <div className="rounded-lg bg-white p-6 shadow">
                    <EditAppointmentForm
                        appointment={appointment}
                        patients={patients}
                    />
                </div>
            </div>
        </div>
    )
}
