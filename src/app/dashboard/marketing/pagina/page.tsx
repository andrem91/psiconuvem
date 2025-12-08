import { getMyProfile } from '@/lib/actions/professional-profile'
import { ProfileEditor } from '@/components/marketing/ProfileEditor'
import { Globe, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function MarketingPaginaPage() {
    const profile = await getMyProfile()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Sua Página Profissional
                    </h1>
                    <p className="mt-1 text-gray-600">
                        Crie uma landing page para atrair novos pacientes
                    </p>
                </div>
                {profile?.slug && (
                    <Link
                        href={`/p/${profile.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Ver Página
                    </Link>
                )}
            </div>

            {/* Card com Editor */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-6 flex items-center gap-3 rounded-lg bg-indigo-50 px-4 py-3">
                    <Globe className="h-5 w-5 text-indigo-600" />
                    <div>
                        <p className="font-medium text-indigo-900">
                            Seu site profissional gratuito
                        </p>
                        <p className="text-sm text-indigo-700">
                            Compartilhe o link nas redes sociais para atrair pacientes
                        </p>
                    </div>
                </div>

                <ProfileEditor initialProfile={profile} />
            </div>
        </div>
    )
}
