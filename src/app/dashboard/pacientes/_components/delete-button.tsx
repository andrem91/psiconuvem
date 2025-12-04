'use client'

import { useState } from 'react'
import { deletePatient } from '@/lib/actions/patients'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

interface DeletePatientButtonProps {
    id: string
    name: string
}

export function DeletePatientButton({ id, name }: DeletePatientButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!confirm(`Tem certeza que deseja excluir "${name}"?\n\nEsta ação não pode ser desfeita.`)) {
            return
        }

        setIsDeleting(true)

        try {
            const result = await deletePatient(id)

            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || 'Erro ao excluir paciente')
                setIsDeleting(false)
            }
        } catch (error) {
            alert('Erro ao excluir paciente. Tente novamente.')
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center gap-1"
            title={`Excluir ${name}`}
        >
            {isDeleting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Excluindo...
                </>
            ) : (
                <>
                    <Trash2 className="w-4 h-4" />
                    Excluir
                </>
            )}
        </button>
    )
}