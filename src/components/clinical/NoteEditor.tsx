'use client'

import { useState, useEffect, useCallback } from 'react'
import { updateClinicalNote, createClinicalNote } from '@/lib/actions/clinical-notes'
import { Shield, Save, Loader2 } from 'lucide-react'

interface NoteEditorProps {
    mode: 'create' | 'edit'
    patientId: string
    noteId?: string
    initialContent?: string
    sessionDate?: string
    sessionNumber?: number
    sessionType?: string
    onSave?: () => void
}

/**
 * Editor de prontuário com auto-save e indicadores de segurança.
 */
export function NoteEditor({
    mode,
    patientId,
    noteId,
    initialContent = '',
    sessionDate,
    sessionNumber,
    sessionType = 'Sessão Individual',
    onSave,
}: NoteEditorProps) {
    const [content, setContent] = useState(initialContent)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

    // Debounce auto-save (salva 2s após parar de digitar)
    useEffect(() => {
        if (!hasChanges || mode !== 'edit' || !noteId) return

        const timer = setTimeout(async () => {
            await saveNote()
        }, 2000)

        return () => clearTimeout(timer)
    }, [content, hasChanges])

    const saveNote = useCallback(async () => {
        if (isSaving) return

        setIsSaving(true)
        try {
            if (mode === 'edit' && noteId) {
                const result = await updateClinicalNote({ noteId, content })
                if (result.success) {
                    setLastSaved(new Date())
                    setHasChanges(false)
                }
            }
        } catch (error) {
            console.error('Erro ao salvar:', error)
        } finally {
            setIsSaving(false)
        }
    }, [mode, noteId, content, isSaving])

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value)
        setHasChanges(true)
    }

    const handleCreate = async () => {
        if (!content.trim()) return

        setIsSaving(true)
        try {
            const result = await createClinicalNote({
                patientId,
                sessionDate: sessionDate || new Date().toISOString(),
                duration: 50,
                sessionType,
                content,
            })

            if (result.success) {
                onSave?.()
            }
        } catch (error) {
            console.error('Erro ao criar:', error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header com indicadores de segurança */}
            <div className="mb-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-2">
                <div className="flex items-center gap-2 text-emerald-700">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        Criptografia AES-256 Ativa
                    </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    {isSaving && (
                        <span className="flex items-center gap-1 text-blue-600">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Salvando...
                        </span>
                    )}
                    {!isSaving && lastSaved && (
                        <span className="text-emerald-600">
                            ✓ Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    {hasChanges && !isSaving && mode === 'edit' && (
                        <span className="text-yellow-600">Alterações não salvas</span>
                    )}
                </div>
            </div>

            {/* Cabeçalho da sessão */}
            {sessionNumber && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Sessão #{sessionNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {sessionType} • {sessionDate && new Date(sessionDate).toLocaleDateString('pt-BR')}
                    </p>
                </div>
            )}

            {/* Editor */}
            <textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Digite suas anotações clínicas aqui...

Dicas:
• Use o formato SOAP (Subjetivo, Objetivo, Avaliação, Plano)
• Registre os pontos principais da sessão
• Anote tarefas ou exercícios para a próxima sessão"
                className="flex-1 resize-none rounded-lg border border-gray-300 p-4 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ minHeight: '400px' }}
            />

            {/* Botão de salvar (apenas no modo create) */}
            {mode === 'create' && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleCreate}
                        disabled={isSaving || !content.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Salvar Prontuário
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
