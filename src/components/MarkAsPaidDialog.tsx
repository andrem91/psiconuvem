'use client'

import { useState } from 'react'
import { markSessionAsPaid, markMonthlyInvoiceAsPaid } from '@/lib/actions/financial'
import type { PaymentMethod } from '@/lib/actions/financial'

interface MarkAsPaidDialogProps {
    isOpen: boolean
    onClose: () => void
    type: 'session' | 'invoice'
    id: string
    patientName: string
    amount: number
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'CASH', label: 'Dinheiro' },
    { value: 'PIX', label: 'PIX' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
    { value: 'BANK_TRANSFER', label: 'Transferência Bancária' },
]

export function MarkAsPaidDialog({
    isOpen,
    onClose,
    type,
    id,
    patientName,
    amount,
}: MarkAsPaidDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            let result
            if (type === 'session') {
                result = await markSessionAsPaid(id, {
                    paymentMethod,
                    paymentNotes: notes,
                })
            } else {
                result = await markMonthlyInvoiceAsPaid(id, {
                    paymentMethod,
                    notes,
                })
            }

            if (result.success) {
                setMessage({ type: 'success', text: '✅ Pagamento registrado com sucesso!' })
                // Fechar após 1.5s e atualizar a página
                setTimeout(() => {
                    onClose()
                    window.location.href = window.location.pathname
                }, 1500)
            } else {
                setMessage({ type: 'error', text: '❌ Erro: ' + result.error })
            }
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Erro ao registrar pagamento' })
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-900">Marcar como Pago</h2>
                <p className="mt-2 text-sm text-gray-600">
                    {patientName} - R$ {amount.toFixed(2)}
                </p>

                {/* Message display */}
                {message && (
                    <div className={`mt-4 rounded-md p-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Forma de Pagamento
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                        >
                            {paymentMethods.map((method) => (
                                <option key={method.value} value={method.value}>
                                    {method.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Observações (opcional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            placeholder="Notas sobre o pagamento..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Confirmar Pagamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
