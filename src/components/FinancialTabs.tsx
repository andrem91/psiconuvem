'use client'

import { useState } from 'react'
import { PaymentBadge, PaymentStatus } from './PaymentBadge'
import { MarkAsPaidDialog } from './MarkAsPaidDialog'
import { formatCurrency } from '@/lib/utils/format'
import { formatDate } from '@/lib/utils/date'
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react'
import { deleteFinancialRecord } from '@/lib/actions/financial-records'

interface Session {
    id: string
    patientName: string
    date: string
    amount: number
    status: PaymentStatus
}

interface Invoice {
    id: string
    patientName: string
    month: string
    dueDate: string
    amount: number
    status: PaymentStatus
}

interface ManualRecord {
    id: string
    description: string
    amount: number
    date: string
    type: 'INCOME' | 'EXPENSE'
    category: string
    status: string
    patientName: string
}

interface FinancialTabsProps {
    sessions: Session[]
    invoices: Invoice[]
    manualRecords: ManualRecord[]
}

export function FinancialTabs({ sessions, invoices, manualRecords }: FinancialTabsProps) {
    const [activeTab, setActiveTab] = useState<'extract' | 'sessions' | 'invoices'>('extract')
    const [selectedPayment, setSelectedPayment] = useState<{
        type: 'session' | 'invoice'
        id: string
        patientName: string
        amount: number
    } | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    // Combinar todos os registros para o extrato (ordenado por data)
    interface ExtractItem {
        id: string
        description: string
        amount: number
        date: string
        type: string
        category: string
        status: string
        origin: string
        patientName?: string
    }

    const extractItems: ExtractItem[] = [
        ...manualRecords.map(r => ({ ...r, origin: 'manual' as const })),
        ...sessions.map(s => ({
            id: s.id, description: `Sessão - ${s.patientName}`, amount: s.amount, date: s.date,
            type: 'INCOME' as const, category: 'SESSION' as const, status: s.status, origin: 'session' as const
        })),
        ...invoices.map(i => ({
            id: i.id, description: `Mensalidade - ${i.patientName}`, amount: i.amount, date: i.dueDate,
            type: 'INCOME' as const, category: 'MONTHLY' as const, status: i.status, origin: 'invoice' as const
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const handleMarkAsPaid = (
        type: 'session' | 'invoice',
        id: string,
        patientName: string,
        amount: number,
    ) => {
        setSelectedPayment({ type, id, patientName, amount })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este lançamento?')) {
            await deleteFinancialRecord(id)
        }
    }

    return (
        <div>
            <div className="mb-6 flex space-x-4 border-b border-gray-200">
                <button
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'extract' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('extract')}
                >
                    Extrato Completo
                </button>
                <button
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'sessions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('sessions')}
                >
                    Sessões Avulsas
                </button>
                <button
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'invoices' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('invoices')}
                >
                    Mensalidades
                </button>
            </div>

            {activeTab === 'extract' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Categoria</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {extractItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Nenhum lançamento neste período.
                                    </td>
                                </tr>
                            ) : (
                                extractItems.map((item) => (
                                    <tr key={`${item.origin}-${item.id}`} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                            {formatDate(item.date)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                            {item.description}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {item.category === 'SESSION' && 'Sessão'}
                                            {item.category === 'MONTHLY' && 'Mensalidade'}
                                            {item.category === 'OTHER' && 'Outros'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                            <div className="flex items-center gap-1">
                                                {item.type === 'INCOME' ? (
                                                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                <span className={item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                                    {formatCurrency(item.amount)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <PaymentBadge status={item.status as PaymentStatus} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            {item.origin === 'manual' && (
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'sessions' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Paciente
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Data
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Valor
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sessions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                                        Nenhuma sessão neste período.
                                    </td>
                                </tr>
                            ) : (
                                sessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                                            {session.patientName}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                            {formatDate(session.date)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                            {formatCurrency(session.amount)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <PaymentBadge status={session.status} />
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            {session.status !== 'PAID' && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(
                                                        'session',
                                                        session.id,
                                                        session.patientName,
                                                        session.amount
                                                    )}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Marcar como Pago
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'invoices' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Paciente
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Mês de Ref.
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Vencimento
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Valor
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                        Nenhuma fatura neste período.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                                            {invoice.patientName}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                            {invoice.month}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                            {formatDate(invoice.dueDate)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                            {formatCurrency(invoice.amount)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <PaymentBadge status={invoice.status} />
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            {invoice.status !== 'PAID' && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(
                                                        'invoice',
                                                        invoice.id,
                                                        invoice.patientName,
                                                        invoice.amount
                                                    )}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Marcar como Pago
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <MarkAsPaidDialog
                isOpen={dialogOpen}
                onClose={() => {
                    setDialogOpen(false)
                    setSelectedPayment(null)
                }}
                type={selectedPayment?.type || 'session'}
                id={selectedPayment?.id || ''}
                patientName={selectedPayment?.patientName || ''}
                amount={selectedPayment?.amount || 0}
            />
        </div>
    )
}
