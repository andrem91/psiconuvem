import { getPatientById } from '@/lib/actions/patients'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { EditPatientForm } from '../../_components/edit-form'
import { PaymentConfigForm } from '../_components/PaymentConfigForm'
import { GenerateInvoiceButton } from '../_components/GenerateInvoiceButton'

type EditPatientPageProps = {
    params: Promise<{ id: string }>
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
    const { id } = await params
    const patient = await getPatientById(id)

    if (!patient) {
        notFound()
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link
                    href={`/dashboard/pacientes/${id}`}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar para detalhes
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Editar Paciente</h1>
                <p className="text-sm text-gray-500 mt-1">{patient.name}</p>
            </div>

            {/* Formulários */}
            <div className="max-w-4xl space-y-6">
                {/* Dados do Paciente */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Dados Pessoais
                    </h2>
                    <EditPatientForm patient={patient} />
                </div>

                {/* Configuração Financeira */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        💰 Configuração Financeira
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Defina como este paciente realiza os pagamentos
                    </p>
                    <PaymentConfigForm
                        patientId={patient.id}
                        initialModel={patient.paymentModel as any}
                        initialMonthlyPrice={patient.monthlyPlanPrice}
                        initialPaymentDueDay={patient.paymentDueDay}
                        initialPlanStartDate={patient.planStartDate}
                    />

                    {/* Botão para gerar fatura - apenas para plano mensal */}
                    {patient.paymentModel === 'MONTHLY_PLAN' && (
                        <GenerateInvoiceButton
                            patientId={patient.id}
                            patientName={patient.name}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
