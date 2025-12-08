'use client'

import { ClinicalNoteSummary } from '@/lib/actions/clinical-notes'
import { FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface HistorySidebarProps {
    patientId: string
    notes: ClinicalNoteSummary[]
    currentNoteId?: string
}

/**
 * Sidebar com histórico de sessões anteriores.
 */
export function HistorySidebar({ patientId, notes, currentNoteId }: HistorySidebarProps) {
    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-2 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">Nenhuma sessão anterior</p>
            </div>
        )
    }

    return (
        <div className="divide-y divide-gray-100">
            {notes.map((note) => {
                const isActive = note.id === currentNoteId
                const date = new Date(note.sessionDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                })

                return (
                    <Link
                        key={note.id}
                        href={`/dashboard/pacientes/${patientId}/prontuario/${note.id}`}
                        className={`block p-3 transition-colors ${isActive
                                ? 'bg-indigo-50 border-l-2 border-indigo-500'
                                : 'hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">
                                        Sessão #{note.sessionNumber}
                                    </span>
                                    <span className="text-xs text-gray-500">{date}</span>
                                </div>
                                <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                                    {note.preview}
                                </p>
                            </div>
                            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
