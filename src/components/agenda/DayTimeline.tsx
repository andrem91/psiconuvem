'use client'

import {
    GRID_START_HOUR,
    GRID_END_HOUR,
    HOUR_HEIGHT,
    getGridHeight,
    getHourLabels,
    getCurrentTimePosition,
    isToday,
} from '@/lib/utils/time-grid'
import { useEffect, useState } from 'react'

interface DayTimelineProps {
    selectedDate: Date
    children: React.ReactNode
}

/**
 * Grid visual de horas do dia (07:00 - 22:00).
 * Os appointments são renderizados como children com posicionamento absoluto.
 */
export function DayTimeline({ selectedDate, children }: DayTimelineProps) {
    const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null)
    const hourLabels = getHourLabels()
    const gridHeight = getGridHeight()
    const showCurrentTime = isToday(selectedDate)

    // Atualiza a linha do "agora" a cada minuto
    useEffect(() => {
        if (!showCurrentTime) {
            setCurrentTimePosition(null)
            return
        }

        const updatePosition = () => {
            setCurrentTimePosition(getCurrentTimePosition())
        }

        updatePosition()
        const interval = setInterval(updatePosition, 60000) // 1 min

        return () => clearInterval(interval)
    }, [showCurrentTime])

    return (
        <div className="relative flex">
            {/* Labels de hora (coluna esquerda) */}
            <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-gray-50">
                {hourLabels.map((label, index) => (
                    <div
                        key={label}
                        className="relative text-right text-xs text-gray-500"
                        style={{ height: index < hourLabels.length - 1 ? HOUR_HEIGHT : 0 }}
                    >
                        <span className="absolute -top-2 right-2">{label}</span>
                    </div>
                ))}
            </div>

            {/* Grid principal */}
            <div className="relative flex-1" style={{ height: gridHeight }}>
                {/* Linhas horizontais para cada hora */}
                {hourLabels.map((label, index) => (
                    <div
                        key={label}
                        className="absolute left-0 right-0 border-t border-gray-100"
                        style={{ top: index * HOUR_HEIGHT }}
                    />
                ))}

                {/* Linha do horário atual */}
                {showCurrentTime && currentTimePosition !== null && (
                    <div
                        className="absolute left-0 right-0 z-20 flex items-center"
                        style={{ top: currentTimePosition }}
                    >
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-0.5 flex-1 bg-red-500" />
                    </div>
                )}

                {/* Appointments (children com posicionamento absoluto) */}
                {children}
            </div>
        </div>
    )
}
