import { getClinicalNotes } from '@/lib/actions/clinical-notes'
import { getPatientById } from '@/lib/actions/patients'
import { NoteEditor } from '@/components/clinical/NoteEditor'
import { HistorySidebar } from '@/components/clinical/HistorySidebar'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function NovaProntuarioPage({ params }: PageProps) {
    const { id: patientId } = await params
    const [patient, notes] = await Promise.all([
        getPatientById(patientId),
        getClinicalNotes(patientId),
    ])

    if (!patient) {
        notFound()
    }

    const nextSessionNumber = notes.length + 1

    const handleRedirect = () => {
        redirect(`/dashboard/pacientes/${patientId}/prontuario`)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/dashboard/pacientes/${patientId}/prontuario`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Nova Sessão: {patient.name}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Sessão #{nextSessionNumber}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                        Criptografia Ativa
                    </span>
                </div>
            </div>

            {/* Layout */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Sidebar */}
                <div className="rounded-xl border border-gray-200 bg-white lg:col-span-1">
                    <div className="border-b border-gray-200 px-4 py-3">
                        <h2 className="font-semibold text-gray-900">
                            Sessões Anteriores
                        </h2>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <HistorySidebar patientId={patientId} notes={notes} />
                    </div>
                </div>

                {/* Editor */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        Registro da Sessão #{nextSessionNumber}
                    </h2>
                    <NoteEditor
                        mode="create"
                        patientId={patientId}
                        sessionType="Sessão Individual"
                    />
                </div>
            </div>
        </div>
    )
}
