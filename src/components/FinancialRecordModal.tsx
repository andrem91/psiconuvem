'use client'

import { useState, useTransition } from 'react'
import { X, Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { createFinancialRecord } from '@/lib/actions/financial-records'
import { getTodayDateString } from '@/lib/utils/date'

interface FinancialRecordModalProps {
    isOpen: boolean
    onClose: () => void
    defaultType?: 'INCOME' | 'EXPENSE'
}

export function FinancialRecordModal({ isOpen, onClose, defaultType = 'INCOME' }: FinancialRecordModalProps) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const [recordType, setRecordType] = useState<'INCOME' | 'EXPENSE'>(defaultType)
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(getTodayDateString())
    const [category, setCategory] = useState<'SESSION' | 'MONTHLY' | 'OTHER'>('OTHER')
    const [status, setStatus] = useState<'PENDING' | 'PAID' | 'OVERDUE'>('PAID')

    if (!isOpen) return null

    const resetForm = () => {
        setDescription('')
        setAmount('')
        setDate(getTodayDateString())
        setCategory('OTHER')
        setStatus('PAID')
        setRecordType(defaultType)
        setMessage(null)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        // Validação simples
        if (!description.trim()) {
            setMessage({ type: 'error', text: 'Descrição é obrigatória' })
            return
        }

        const parsedAmount = parseFloat(amount.replace(',', '.'))
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setMessage({ type: 'error', text: 'Valor deve ser maior que zero' })
            return
        }

        startTransition(async () => {
            try {
                await createFinancialRecord({
                    description: description.trim(),
                    amount: parsedAmount,
                    date: date,
                    type: recordType,
                    category: category,
                    status: status,
                    patientId: null
                })
                setMessage({ type: 'success', text: 'Lançamento criado com sucesso!' })
                setTimeout(() => {
                    onClose()
                    resetForm()
                }, 1500)
            } catch (error) {
                setMessage({ type: 'error', text: 'Erro ao criar lançamento.' })
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {recordType === 'INCOME' ? 'Nova Receita' : 'Nova Despesa'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {message && (
                    <div className={`mb-4 rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tipo Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setRecordType('INCOME')}
                            className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${recordType === 'INCOME' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ArrowUpCircle className="h-4 w-4" />
                            Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => setRecordType('EXPENSE')}
                            className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${recordType === 'EXPENSE' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ArrowDownCircle className="h-4 w-4" />
                            Despesa
                        </button>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Ex: Aluguel, Material de escritório..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Valor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                            <input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                type="text"
                                inputMode="decimal"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0,00"
                            />
                        </div>

                        {/* Data */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data</label>
                            <input
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                type="date"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Categoria */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Categoria</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as 'SESSION' | 'MONTHLY' | 'OTHER')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="OTHER">Outros</option>
                                <option value="SESSION">Sessão</option>
                                <option value="MONTHLY">Mensalidade</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as 'PENDING' | 'PAID' | 'OVERDUE')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="PAID">Pago / Recebido</option>
                                <option value="PENDING">Pendente</option>
                                <option value="OVERDUE">Atrasado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {recordType === 'INCOME' ? 'Adicionar Receita' : 'Adicionar Despesa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
