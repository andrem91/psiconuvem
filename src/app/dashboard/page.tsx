import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const psychologist = await prisma.psychologist.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            _count: {
                select: {
                    patients: true,
                    appointments: true,
                },
            },
        },
    })

    if (!psychologist) {
        redirect('/login')
    }

    const trialDaysLeft = psychologist.trialEndsAt
        ? Math.max(
            0,
            Math.ceil(
                (psychologist.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
        )
        : 0

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-bold text-gray-900">PsicoNuvem</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Olá, {psychologist.user.name}
                            </span>
                            <form
                                action={async () => {
                                    'use server'
                                    await signOut({ redirectTo: '/login' })
                                }}
                            >
                                <button
                                    type="submit"
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Sair
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Trial Banner */}
                {psychologist.plan === 'TRIAL' && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800">
                            🎉 Você está no período de teste.{' '}
                            <strong>{trialDaysLeft} dias restantes.</strong>
                        </p>
                    </div>
                )}

                {/* Cards de estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500">Pacientes</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {psychologist._count.patients}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500">Consultas</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {psychologist._count.appointments}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500">Plano</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {psychologist.plan}
                        </p>
                    </div>
                </div>

                {/* Info do perfil */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Seu Perfil
                    </h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm text-gray-500">CRP</dt>
                            <dd className="text-gray-900">{psychologist.crp}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">URL do seu site</dt>
                            <dd className="text-blue-600">
                                psiconuvem.com/p/{psychologist.slug}
                            </dd>
                        </div>
                    </dl>
                </div>
            </main>
        </div>
    )
}
