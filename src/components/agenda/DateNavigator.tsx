'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { formatDateParam } from '@/lib/utils/time-grid'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface DateNavigatorProps {
    selectedDate: Date
}

/**
 * Navegação de datas: Ontem | Hoje | Amanhã
 */
export function DateNavigator({ selectedDate }: DateNavigatorProps) {
    const router = useRouter()

    const navigateToDate = (date: Date) => {
        router.push(`/dashboard/agenda?date=${formatDateParam(date)}`)
    }

    const goToPreviousDay = () => {
        const prev = new Date(selectedDate)
        prev.setDate(prev.getDate() - 1)
        navigateToDate(prev)
    }

    const goToNextDay = () => {
        const next = new Date(selectedDate)
        next.setDate(next.getDate() + 1)
        navigateToDate(next)
    }

    const goToToday = () => {
        navigateToDate(new Date())
    }

    const isToday =
        selectedDate.toDateString() === new Date().toDateString()

    // Formatar data para exibição
    const dateStr = selectedDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={goToPreviousDay}
                className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100"
                title="Dia anterior"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            <button
                onClick={goToToday}
                disabled={isToday}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${isToday
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
            >
                <Calendar className="h-4 w-4" />
                {isToday ? 'Hoje' : 'Ir para Hoje'}
            </button>

            <button
                onClick={goToNextDay}
                className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100"
                title="Próximo dia"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            <span className="ml-4 text-lg font-medium capitalize text-gray-900">
                {dateStr}
            </span>
        </div>
    )
}
