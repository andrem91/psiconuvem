'use client'

import { timeToPixels, durationToPixels } from '@/lib/utils/time-grid'
import { formatTime } from '@/lib/utils/date'
import { AppointmentStatusBadge } from '@/components/AppointmentStatusBadge'
import Link from 'next/link'
import { Video, User } from 'lucide-react'

interface AppointmentBlockProps {
    id: string
    scheduledAt: string
    duration: number
    status: string
    type: string
    meetLink: string | null
    patient: { id: string; name: string } | null
    paymentStatus: string | null
}

/**
 * Bloco visual de um agendamento posicionado no grid de tempo.
 */
export function AppointmentBlock({
    id,
    scheduledAt,
    duration,
    status,
    type,
    meetLink,
    patient,
    paymentStatus,
}: AppointmentBlockProps) {
    const top = timeToPixels(scheduledAt)
    const height = durationToPixels(duration)

    // Cores por status
    const statusColors: Record<string, string> = {
        SCHEDULED: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
        COMPLETED: 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200',
        CANCELLED: 'bg-gray-100 border-gray-300 hover:bg-gray-200',
        NO_SHOW: 'bg-red-100 border-red-300 hover:bg-red-200',
    }

    const colorClass = statusColors[status] || statusColors.SCHEDULED

    return (
        <Link
            href={`/dashboard/agenda/${id}`}
            className={`absolute left-1 right-1 z-10 overflow-hidden rounded-lg border-l-4 p-2 transition-colors ${colorClass}`}
            style={{
                top: `${top}px`,
                height: `${Math.max(height, 40)}px`, // Altura mínima de 40px
            }}
        >
            <div className="flex h-full flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                            {formatTime(scheduledAt)}
                        </span>
                        {meetLink && <Video className="h-3 w-3 text-blue-600" />}
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
                        {patient?.name || 'Paciente'}
                    </p>
                </div>

                {height >= 60 && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span>{duration} min</span>
                        <span>•</span>
                        <span>{type}</span>
                    </div>
                )}
            </div>
        </Link>
    )
}
