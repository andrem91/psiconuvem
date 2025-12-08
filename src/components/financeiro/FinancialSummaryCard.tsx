import { cn } from '@/lib/utils'

interface FinancialSummaryCardProps {
    title: string
    amount: number
    variant?: 'default' | 'success' | 'warning' | 'danger'
    icon?: React.ReactNode
    className?: string
}

const variantStyles = {
    default: {
        bg: 'bg-white',
        border: 'border-gray-200',
        title: 'text-gray-600',
        amount: 'text-gray-900',
    },
    success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        title: 'text-green-700',
        amount: 'text-green-900',
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        title: 'text-yellow-700',
        amount: 'text-yellow-900',
    },
    danger: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        title: 'text-red-700',
        amount: 'text-red-900',
    },
} as const

/**
 * Formata valor monetário em BRL
 */
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

export function FinancialSummaryCard({
    title,
    amount,
    variant = 'default',
    icon,
    className,
}: FinancialSummaryCardProps) {
    const styles = variantStyles[variant]

    return (
        <div
            className={cn(
                'rounded-lg border p-6 transition-shadow hover:shadow-md',
                styles.bg,
                styles.border,
                className,
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className={cn('text-sm font-medium', styles.title)}>{title}</p>
                    <p className={cn('mt-2 text-3xl font-bold', styles.amount)}>
                        {formatCurrency(amount)}
                    </p>
                </div>
                {icon && (
                    <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/50">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    )
}
