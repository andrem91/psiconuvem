'use client'

import { useState, useTransition } from 'react'
import { setPatientPaymentModel } from '@/lib/actions/financial'

interface PaymentConfigFormProps {
    patientId: string
    initialModel?: 'PER_SESSION' | 'MONTHLY_PLAN'
    initialMonthlyPrice?: number | null
    initialPaymentDueDay?: number | null
    initialPlanStartDate?: string | null
}

export function PaymentConfigForm({
    patientId,
    initialModel = 'PER_SESSION',
    initialMonthlyPrice,
    initialPaymentDueDay,
    initialPlanStartDate,
}: PaymentConfigFormProps) {
    const [paymentModel, setPaymentModel] = useState(initialModel)
    const [monthlyPrice, setMonthlyPrice] = useState(initialMonthlyPrice ?? '')
    const [dueDay, setDueDay] = useState(initialPaymentDueDay ?? '')
    const [planStartDate, setPlanStartDate] = useState(initialPlanStartDate || '')
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        startTransition(async () => {
            const result = await setPatientPaymentModel(patientId, {
                paymentModel,
                monthlyPlanPrice: paymentModel === 'MONTHLY_PLAN' && monthlyPrice ? Number(monthlyPrice) : undefined,
                paymentDueDay: paymentModel === 'MONTHLY_PLAN' && dueDay ? Number(dueDay) : undefined,
                planStartDate: paymentModel === 'MONTHLY_PLAN' && planStartDate ? planStartDate : undefined,
            })

            if (result.success) {
                setMessage({ type: 'success', text: '✅ Configuração de pagamento atualizada!' })
            } else {
                setMessage({ type: 'error', text: '❌ Erro: ' + result.error })
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Modelo de Cobrança */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Modelo de Cobrança
                </label>
                <select
                    value={paymentModel}
                    onChange={(e) => setPaymentModel(e.target.value as any)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    disabled={isPending}
                >
                    <option value="PER_SESSION">Por Sessão (Avulso)</option>
                    <option value="MONTHLY_PLAN">Plano Mensal</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                    {paymentModel === 'PER_SESSION'
                        ? 'Pagamento individual por cada sessão realizada'
                        : 'Mensalidade fixa com quantidade de sessões incluídas'}
                </p>
            </div>

            {/* Campos para Plano Mensal */}
            {paymentModel === 'MONTHLY_PLAN' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Valor da Mensalidade (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={monthlyPrice}
                            onChange={(e) => setMonthlyPrice(parseFloat(e.target.value))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            required
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Dia de Vencimento (1-31)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={dueDay}
                            onChange={(e) => setDueDay(parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            required
                            disabled={isPending}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Dia do mês em que a mensalidade vence
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Data de Início do Plano
                        </label>
                        <input
                            type="date"
                            value={planStartDate}
                            onChange={(e) => setPlanStartDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            disabled={isPending}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Quando o plano mensal inicia. Faturas só serão geradas a partir desta data.
                        </p>
                    </div>
                </>
            )}

            {/* Message display */}
            {message && (
                <div className={`rounded-md p-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? 'Salvando...' : 'Salvar Configuração'}
                </button>
            </div>
        </form>
    )
}
