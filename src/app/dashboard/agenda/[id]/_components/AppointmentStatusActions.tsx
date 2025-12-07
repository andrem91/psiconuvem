'use client'

import { useState, useTransition } from 'react'
import { updateAppointmentStatus, deleteAppointment } from '@/lib/actions/appointments'
import { markSessionAsPaid } from '@/lib/actions/financial'
import { useRouter } from 'next/navigation'

interface AppointmentStatusActionsProps {
    appointmentId: string
    currentStatus: string
    paymentStatus: string
    sessionPrice: number | null
}

export function AppointmentStatusActions({
    appointmentId,
    currentStatus,
    paymentStatus,
    sessionPrice
}: AppointmentStatusActionsProps) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const router = useRouter()

    const canComplete = currentStatus === 'SCHEDULED'
    const canCancel = currentStatus === 'SCHEDULED'
    const canMarkNoShow = currentStatus === 'SCHEDULED'
    const canMarkPaid = (paymentStatus === 'PENDING' || paymentStatus === 'OVERDUE') &&
        sessionPrice != null && sessionPrice > 0

    const handleStatusChange = (newStatus: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW') => {
        const statusLabels = {
            'COMPLETED': 'concluído',
            'CANCELLED': 'cancelado',
            'NO_SHOW': 'não compareceu',
        }

        if (!confirm(`Deseja marcar este agendamento como "${statusLabels[newStatus]}"?`)) return

        setMessage(null)
        startTransition(async () => {
            const result = await updateAppointmentStatus(appointmentId, newStatus)
            if (result.success) {
                setMessage({ type: 'success', text: `✅ Status atualizado para ${statusLabels[newStatus]}` })
                router.refresh()
            } else {
                setMessage({ type: 'error', text: `❌ ${result.error}` })
            }
        })
    }

    const handleMarkPaid = () => {
        setMessage(null)
        startTransition(async () => {
            const result = await markSessionAsPaid(appointmentId, { paymentMethod: 'PIX' })
            if (result.success) {
                setMessage({ type: 'success', text: '✅ Pagamento registrado!' })
                router.refresh()
            } else {
                setMessage({ type: 'error', text: `❌ ${result.error}` })
            }
        })
    }

    const handleDelete = () => {
        if (!confirm('Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.')) return

        setMessage(null)
        startTransition(async () => {
            const result = await deleteAppointment(appointmentId)
            if (result.success) {
                router.push('/dashboard/agenda')
            } else {
                setMessage({ type: 'error', text: `❌ ${result.error}` })
            }
        })
    }

    return (
        <div className="space-y-3">
            {canComplete && (
                <button
                    onClick={() => handleStatusChange('COMPLETED')}
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                    ✅ Marcar como Concluído
                </button>
            )}

            {canMarkPaid && (
                <button
                    onClick={handleMarkPaid}
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                    💸 Marcar como Pago
                </button>
            )}

            {canMarkNoShow && (
                <button
                    onClick={() => handleStatusChange('NO_SHOW')}
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700 disabled:opacity-50"
                >
                    ⚠️ Não Compareceu
                </button>
            )}

            {canCancel && (
                <button
                    onClick={() => handleStatusChange('CANCELLED')}
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    ❌ Cancelar Agendamento
                </button>
            )}

            <hr className="my-4" />

            <button
                onClick={handleDelete}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center rounded-md bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
                🗑️ Excluir Agendamento
            </button>

            {message && (
                <div className={`mt-3 rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}
        </div>
    )
}
