import { getPatients } from '@/lib/actions/patients'
import { AppointmentForm } from './_components/AppointmentForm'
import Link from 'next/link'

export default async function NovoAgendamentoPage() {
    const patients = await getPatients()

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/agenda"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
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
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Voltar para agenda
                </Link>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                    Novo Agendamento
                </h1>
                <p className="mt-1 text-gray-500">
                    Agende uma nova consulta com seu paciente
                </p>
            </div>

            {/* Form Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                {patients.length === 0 ? (
                    <div className="text-center py-12">
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
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            Nenhum paciente cadastrado
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Você precisa cadastrar um paciente antes de criar agendamentos.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/dashboard/pacientes/novo"
                                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Cadastrar Paciente
                            </Link>
                        </div>
                    </div>
                ) : (
                    <AppointmentForm patients={patients} />
                )}
            </div>
        </div>
    )
}
