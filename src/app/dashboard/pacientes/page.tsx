import { getPatients } from '@/lib/actions/patients'
import Link from 'next/link'
import { Plus, Pencil, Phone, Mail } from 'lucide-react'
import { DeletePatientButton } from './_components/delete-button'

export default async function PacientesPage() {
    const patients = await getPatients()

    return (
        <div>
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Gerencie seus pacientes, prontuários e dados de contato.
                    </p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/dashboard/pacientes/novo"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Novo Paciente
                    </Link>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
                {patients.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nenhum paciente cadastrado.</p>
                        <Link
                            href="/dashboard/pacientes/novo"
                            className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Cadastrar primeiro paciente
                        </Link>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                    Nome
                                </th>
                                <th className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">
                                    Contato
                                </th>
                                <th className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">
                                    LGPD
                                </th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {patients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                        <div className="font-medium text-gray-900">{patient.name}</div>
                                        {patient.birthdate && (
                                            <div className="text-sm text-gray-500">
                                                {new Date(patient.birthdate).toLocaleDateString('pt-BR')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                                        <div className="flex flex-col gap-1">
                                            {patient.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {patient.phone}
                                                </span>
                                            )}
                                            {patient.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {patient.email}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="hidden whitespace-nowrap px-3 py-4 text-sm lg:table-cell">
                                        {patient.lgpdConsent ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                Autorizado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                Pendente
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <div className="flex justify-end gap-4">
                                            <Link
                                                href={`/dashboard/pacientes/${patient.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                Editar
                                            </Link>
                                            <DeletePatientButton id={patient.id} name={patient.name} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}