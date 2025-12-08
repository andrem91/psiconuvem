import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Plus, User, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Patient {
    id: string
    name: string
    email: string | null
    phone: string
    _count?: {
        clinicalNotes: number
    }
    clinicalNotes?: Array<{
        id: string
        createdAt: string
    }>
}

export default async function ProntuariosPage() {
    const supabase = await createClient()
    const psychologistId = await getCurrentPsychologistId()

    if (!psychologistId) {
        redirect('/login')
    }

    // Buscar pacientes com contagem de notas clínicas
    const { data: patients, error } = await supabase
        .from('Patient')
        .select(`
            id,
            name,
            email,
            phone,
            ClinicalNote(id, createdAt)
        `)
        .eq('psychologistId', psychologistId)
        .is('deletedAt', null)
        .order('name')

    if (error) {
        console.error('Erro ao buscar pacientes:', error)
    }

    // Processar dados para exibição
    const patientsWithNotes = (patients || []).map((patient: Patient & { ClinicalNote?: Array<{ id: string; createdAt: string }> }) => ({
        ...patient,
        noteCount: patient.ClinicalNote?.length || 0,
        lastNote: patient.ClinicalNote?.[0]?.createdAt
    })).sort((a, b) => b.noteCount - a.noteCount) // Ordenar por quantidade de notas

    const totalNotes = patientsWithNotes.reduce((sum, p) => sum + p.noteCount, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prontuários</h1>
                    <p className="text-gray-600 mt-1">
                        {totalNotes} nota{totalNotes !== 1 ? 's' : ''} clínica{totalNotes !== 1 ? 's' : ''} em {patientsWithNotes.length} paciente{patientsWithNotes.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Lista de Pacientes */}
            {patientsWithNotes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum prontuário</h3>
                    <p className="text-gray-600 mt-1">
                        Cadastre pacientes e crie notas clínicas para começar.
                    </p>
                    <Link
                        href="/dashboard/pacientes/novo"
                        className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Paciente
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                    {patientsWithNotes.map((patient) => (
                        <Link
                            key={patient.id}
                            href={`/dashboard/pacientes/${patient.id}/prontuario`}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{patient.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {patient.noteCount} nota{patient.noteCount !== 1 ? 's' : ''} clínica{patient.noteCount !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {patient.lastNote && (
                                    <div className="text-right text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Última nota: {formatDistanceToNow(new Date(patient.lastNote), {
                                                    addSuffix: true,
                                                    locale: ptBR
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="text-indigo-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Dica */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>💡 Dica:</strong> Os prontuários são armazenados de forma criptografada para garantir a segurança dos dados dos seus pacientes.
                </p>
            </div>
        </div>
    )
}
