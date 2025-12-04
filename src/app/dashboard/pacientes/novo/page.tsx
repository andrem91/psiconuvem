import { CreatePatientForm } from '../_components/create-form'
import Link from 'next/link'

export default function NovoPacientePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Cabeçalho simples com voltar */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
                        <p className="text-sm text-gray-500">Cadastre as informações básicas para iniciar o prontuário.</p>
                    </div>
                    <Link
                        href="/dashboard/pacientes"
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                        ← Voltar para lista
                    </Link>
                </div>

                <CreatePatientForm />
            </div>
        </div>
    )
}