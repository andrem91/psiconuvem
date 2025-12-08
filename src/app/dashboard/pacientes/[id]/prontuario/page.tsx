import { getClinicalNotes } from '@/lib/actions/clinical-notes'
import { getPatientById } from '@/lib/actions/patients'
import { NoteEditor } from '@/components/clinical/NoteEditor'
import { HistorySidebar } from '@/components/clinical/HistorySidebar'
import Link from 'next/link'
import { ArrowLeft, Plus, Shield } from 'lucide-react'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ProntuarioPage({ params }: PageProps) {
    const { id: patientId } = await params
    const [patient, notes] = await Promise.all([
        getPatientById(patientId),
        getClinicalNotes(patientId),
    ])

    if (!patient) {
        notFound()
    }

    const latestNote = notes[0]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/dashboard/pacientes/${patientId}`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Prontuário: {patient.name}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {notes.length} sessões registradas
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                        Dados Criptografados
                    </span>
                </div>
            </div>

            {/* Layout de 2 colunas */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Sidebar - Histórico */}
                <div className="rounded-xl border border-gray-200 bg-white lg:col-span-1">
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                        <h2 className="font-semibold text-gray-900">
                            Sessões Anteriores
                        </h2>
                        <Link
                            href={`/dashboard/pacientes/${patientId}/prontuario/nova`}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                            <Plus className="h-3 w-3" />
                            Nova
                        </Link>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <HistorySidebar
                            patientId={patientId}
                            notes={notes}
                            currentNoteId={latestNote?.id}
                        />
                    </div>
                </div>

                {/* Editor - Nota atual ou criar nova */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
                    {latestNote ? (
                        <>
                            <div className="mb-4">
                                <span className="text-sm text-gray-500">
                                    Visualizando a última sessão.
                                    <Link
                                        href={`/dashboard/pacientes/${patientId}/prontuario/nova`}
                                        className="ml-2 font-medium text-indigo-600 hover:text-indigo-700"
                                    >
                                        Criar nova sessão →
                                    </Link>
                                </span>
                            </div>
                            <NoteEditor
                                mode="edit"
                                patientId={patientId}
                                noteId={latestNote.id}
                                initialContent={latestNote.preview.replace('...', '')}
                                sessionNumber={latestNote.sessionNumber}
                                sessionDate={latestNote.sessionDate}
                                sessionType={latestNote.sessionType}
                            />
                        </>
                    ) : (
                        <>
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Primeira Sessão
                            </h2>
                            <NoteEditor
                                mode="create"
                                patientId={patientId}
                                sessionType="Sessão Individual"
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
