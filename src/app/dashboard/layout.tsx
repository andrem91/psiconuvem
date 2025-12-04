import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import Link from 'next/link'
import { Users, Calendar, FileText, Settings, LayoutDashboard } from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo e Links */}
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                                PsicoNuvem
                            </Link>

                            <div className="hidden md:flex items-center gap-6">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Início
                                </Link>
                                <Link
                                    href="/dashboard/pacientes"
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    <Users className="w-4 h-4" />
                                    Pacientes
                                </Link>
                                <Link
                                    href="/dashboard/agenda"
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Agenda
                                </Link>
                                <Link
                                    href="/dashboard/prontuarios"
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    <FileText className="w-4 h-4" />
                                    Prontuários
                                </Link>
                            </div>
                        </div>

                        {/* Usuário e Logout */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/configuracoes"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <Settings className="w-5 h-5" />
                            </Link>
                            <span className="text-sm text-gray-600 hidden sm:block">
                                {user.user_metadata?.name || user.email}
                            </span>
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                                >
                                    Sair
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Conteúdo da página */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
}