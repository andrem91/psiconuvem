import { cn } from '@/lib/utils'

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'

interface PaymentBadgeProps {
    status: PaymentStatus
    className?: string
}

const statusConfig = {
    PENDING: {
        label: 'Pendente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳',
    },
    PAID: {
        label: 'Pago',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: '✓',
    },
    OVERDUE: {
        label: 'Atrasado',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: '⚠',
    },
    CANCELLED: {
        label: 'Cancelado',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: '✕',
    },
} as const

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
    const config = statusConfig[status]

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
                config.className,
                className,
            )}
        >
            <span className="text-sm">{config.icon}</span>
            {config.label}
        </span>
    )
}
