import { getPatientById } from '@/lib/actions/patients'
import { notFound } from 'next/navigation'
import { EditPatientForm } from '../_components/edit-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface EditPatientPageProps {
    params: Promise<{ id: string }>
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
    const { id } = await params
    const patient = await getPatientById(id)

    if (!patient) {
        notFound()
    }

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
                <h1 className="text-2xl font-bold text-gray-900">Editar Paciente</h1>
                <p className="text-sm text-gray-500 mt-1">{patient.name}</p>
            </div>

            {/* Formulário */}
            <div className="max-w-2xl">
                <EditPatientForm patient={patient} />
            </div>
        </div>
    )
}