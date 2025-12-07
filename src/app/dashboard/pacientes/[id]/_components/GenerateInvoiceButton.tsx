'use client'

import { useState, useTransition } from 'react'
import { ensureMonthlyInvoice } from '@/lib/actions/monthly-invoice-helper'

interface GenerateInvoiceButtonProps {
    patientId: string
    patientName: string
}

export function GenerateInvoiceButton({ patientId, patientName }: GenerateInvoiceButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleGenerate = () => {
        setMessage(null)
        startTransition(async () => {
            const result = await ensureMonthlyInvoice(patientId, new Date())

            if (result.success) {
                setMessage({ type: 'success', text: `✅ ${result.message}` })
            } else {
                setMessage({ type: 'error', text: `❌ ${result.error}` })
            }
        })
    }

    return (
        <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
                Gerar Mensalidade
            </h3>
            <button
                onClick={handleGenerate}
                disabled={isPending}
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
                {isPending ? 'Gerando...' : `📄 Gerar fatura do mês atual`}
            </button>
            <p className="mt-2 text-xs text-gray-500">
                Gera a fatura mensal para {patientName} referente ao mês atual
            </p>

            {message && (
                <div className={`mt-3 rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}
        </div>
    )
}
