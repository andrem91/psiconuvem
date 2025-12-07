import { PaymentBadge } from '@/components/PaymentBadge'
import { PaymentModelBadge } from '@/components/PaymentModelBadge'
import { FinancialSummaryCard } from '@/components/FinancialSummaryCard'

export default function TestBadgesPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Teste de Componentes Financeiros
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Visualização dos componentes PaymentBadge, PaymentModelBadge e
                        FinancialSummaryCard
                    </p>
                </div>

                {/* Cards de Resumo Financeiro */}
                <div>
                    <h2 className="mb-4 text-2xl font-semibold">
                        FinancialSummaryCard
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <FinancialSummaryCard
                            title="Recebido"
                            amount={4500}
                            variant="success"
                            icon={<span className="text-2xl">✓</span>}
                        />
                        <FinancialSummaryCard
                            title="Pendente"
                            amount={1200}
                            variant="warning"
                            icon={<span className="text-2xl">⏳</span>}
                        />
                        <FinancialSummaryCard
                            title="Atrasado"
                            amount={450}
                            variant="danger"
                            icon={<span className="text-2xl">⚠</span>}
                        />
                        <FinancialSummaryCard
                            title="Total do Mês"
                            amount={6150}
                            variant="default"
                            icon={<span className="text-2xl">💰</span>}
                        />
                    </div>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-200" />

                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">PaymentBadge</h2>
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <p className="mb-2 text-sm text-gray-600">Pendente:</p>
                            <PaymentBadge status="PENDING" />
                        </div>
                        <div>
                            <p className="mb-2 text-sm text-gray-600">Pago:</p>
                            <PaymentBadge status="PAID" />
                        </div>
                        <div>
                            <p className="mb-2 text-sm text-gray-600">Atrasado:</p>
                            <PaymentBadge status="OVERDUE" />
                        </div>
                        <div>
                            <p className="mb-2 text-sm text-gray-600">Cancelado:</p>
                            <PaymentBadge status="CANCELLED" />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">PaymentModelBadge</h2>
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <p className="mb-2 text-sm text-gray-600">Por Sessão:</p>
                            <PaymentModelBadge model="PER_SESSION" />
                        </div>
                        <div>
                            <p className="mb-2 text-sm text-gray-600">Plano Mensal:</p>
                            <PaymentModelBadge model="MONTHLY_PLAN" />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">
                        Exemplo em Contexto (Tabela de Pacientes)
                    </h2>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2 text-left">Paciente</th>
                                <th className="pb-2 text-left">Modelo</th>
                                <th className="pb-2 text-left">Valor</th>
                                <th className="pb-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="py-3">João Silva</td>
                                <td className="py-3">
                                    <PaymentModelBadge model="MONTHLY_PLAN" />
                                </td>
                                <td className="py-3">R$ 600,00/mês</td>
                                <td className="py-3">
                                    <PaymentBadge status="PAID" />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3">Maria Santos</td>
                                <td className="py-3">
                                    <PaymentModelBadge model="PER_SESSION" />
                                </td>
                                <td className="py-3">R$ 150,00</td>
                                <td className="py-3">
                                    <PaymentBadge status="PENDING" />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3">Pedro Oliveira</td>
                                <td className="py-3">
                                    <PaymentModelBadge model="PER_SESSION" />
                                </td>
                                <td className="py-3">R$ 150,00</td>
                                <td className="py-3">
                                    <PaymentBadge status="OVERDUE" />
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3">Ana Costa</td>
                                <td className="py-3">
                                    <PaymentModelBadge model="MONTHLY_PLAN" />
                                </td>
                                <td className="py-3">R$ 800,00/mês</td>
                                <td className="py-3">
                                    <PaymentBadge status="CANCELLED" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
