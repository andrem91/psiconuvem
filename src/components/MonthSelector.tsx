'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { getCurrentMonth, MONTH_NAMES } from '@/lib/utils/month'

interface MonthSelectorProps {
    defaultMonth?: string // formato: "2024-12"
}

export function MonthSelector({ defaultMonth }: MonthSelectorProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Pegar mês atual da URL ou usar o padrão
    const currentMonthParam = searchParams.get('month') || defaultMonth || getCurrentMonth()
    const parts = currentMonthParam.split('-')
    const year = parseInt(parts[0] || '2024', 10)
    const month = parseInt(parts[1] || '1', 10)

    const monthName = MONTH_NAMES[month - 1]

    const navigateToMonth = (newYear: number, newMonth: number) => {
        // Ajustar ano se mês passar de 12 ou menor que 1
        if (newMonth > 12) {
            newYear++
            newMonth = 1
        } else if (newMonth < 1) {
            newYear--
            newMonth = 12
        }

        const newMonthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`
        const params = new URLSearchParams(searchParams.toString())
        params.set('month', newMonthStr)
        router.push(`${pathname}?${params.toString()}`)
    }

    const goToPreviousMonth = () => navigateToMonth(year, month - 1)
    const goToNextMonth = () => navigateToMonth(year, month + 1)
    const goToCurrentMonth = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('month')
        router.push(`${pathname}?${params.toString()}`)
    }

    const isCurrentMonth = currentMonthParam === getCurrentMonth()

    return (
        <div className="flex items-center gap-4">
            {/* Navegação */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                <button
                    onClick={goToPreviousMonth}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="Mês anterior"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 px-3 py-1 min-w-[160px] justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-gray-900">
                        {monthName} {year}
                    </span>
                </div>

                <button
                    onClick={goToNextMonth}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="Próximo mês"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Botão para voltar ao mês atual */}
            {!isCurrentMonth && (
                <button
                    onClick={goToCurrentMonth}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                    Mês Atual
                </button>
            )}
        </div>
    )
}
