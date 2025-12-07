import { cn } from '@/lib/utils'

export type PaymentModel = 'PER_SESSION' | 'MONTHLY_PLAN'

interface PaymentModelBadgeProps {
    model: PaymentModel
    className?: string
}

const modelConfig = {
    PER_SESSION: {
        label: 'Por Sessão',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '💳',
    },
    MONTHLY_PLAN: {
        label: 'Plano Mensal',
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '📅',
    },
} as const

export function PaymentModelBadge({
    model,
    className,
}: PaymentModelBadgeProps) {
    const config = modelConfig[model]

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
