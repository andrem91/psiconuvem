'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { FinancialRecordModal } from './FinancialRecordModal'

export function FinancialActions() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME')

    const openModal = (type: 'INCOME' | 'EXPENSE') => {
        setModalType(type)
        setIsModalOpen(true)
    }

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={() => openModal('INCOME')}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Receita
                </button>
                <button
                    onClick={() => openModal('EXPENSE')}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Despesa
                </button>
            </div>

            <FinancialRecordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                defaultType={modalType}
            />
        </>
    )
}
