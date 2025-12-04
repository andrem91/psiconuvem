import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Calendar, FileText } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: psychologist } = await supabase
        .from('Psychologist')
        .select('*, patients:Patient(count), appointments:Appointment(count)')
        .eq('userId', user.id)
        .single()

    if (!psychologist) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Erro: Perfil de psicólogo não encontrado.</p>
            </div>
        )
    }

    return (
        <div>
            {/* Boas-vindas */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Bem-vindo(a), {user.user_metadata?.name || 'Psicólogo'}!
                </h1>
                <p className="text-gray-600 mt-1">
                    Aqui está o resumo da sua clínica.
                </p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link
                    href="/dashboard/pacientes"
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Pacientes</h3>
                            <p className="text-3xl font-bold text-gray-900">
                                {psychologist.patients?.[0]?.count || 0}
                            </p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/dashboard/agenda"
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Consultas</h3>
                            <p className="text-3xl font-bold text-gray-900">
                                {psychologist.appointments?.[0]?.count || 0}
                            </p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/dashboard/prontuarios"
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Prontuários</h3>
                            <p className="text-3xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Info do Plano */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seu Plano</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                            {psychologist.plan}
                        </span>
                        {psychologist.trialEndsAt && (
                            <p className="text-sm text-gray-500 mt-2">
                                Trial expira em: {new Date(psychologist.trialEndsAt).toLocaleDateString('pt-BR')}
                            </p>
                        )}
                    </div>
                    <Link
                        href="/dashboard/configuracoes"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                        Gerenciar plano →
                    </Link>
                </div>
            </div>
        </div>
    )
}