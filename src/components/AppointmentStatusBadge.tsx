import { AppointmentStatus } from '@/lib/validations/appointment'

type StatusConfig = {
    label: string
    className: string
}

const statusConfig: Record<AppointmentStatus, StatusConfig> = {
    [AppointmentStatus.SCHEDULED]: {
        label: 'Agendado',
        className: 'bg-blue-100 text-blue-800',
    },
    [AppointmentStatus.COMPLETED]: {
        label: 'Realizado',
        className: 'bg-green-100 text-green-800',
    },
    [AppointmentStatus.CANCELLED]: {
        label: 'Cancelado',
        className: 'bg-gray-100 text-gray-800',
    },
    [AppointmentStatus.NO_SHOW]: {
        label: 'Faltou',
        className: 'bg-red-100 text-red-800',
    },
}

type AppointmentStatusBadgeProps = {
    status: AppointmentStatus
}

export function AppointmentStatusBadge({
    status,
}: AppointmentStatusBadgeProps) {
    const config = statusConfig[status]

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    )
}
