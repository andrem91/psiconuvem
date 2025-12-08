import { getProfileBySlug } from '@/lib/actions/professional-profile'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { MessageCircle, Instagram, Linkedin, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const profile = await getProfileBySlug(slug)

    if (!profile) {
        return { title: 'Perfil não encontrado' }
    }

    const name = profile.psychologist?.name || 'Psicólogo'
    const title = profile.heroTitle || `${name} - Psicólogo`

    return {
        title,
        description: profile.bio?.substring(0, 160) || `Agende uma consulta com ${name}`,
        openGraph: {
            title,
            description: profile.bio?.substring(0, 160) || `Agende uma consulta com ${name}`,
            type: 'profile',
        },
    }
}

export default async function PublicProfilePage({ params }: PageProps) {
    const { slug } = await params
    const profile = await getProfileBySlug(slug)

    if (!profile) {
        notFound()
    }

    const name = profile.psychologist?.name || 'Psicólogo'
    const crp = profile.psychologist?.crp || ''
    const specialties = profile.psychologist?.specialties || []
    const photo = profile.psychologist?.photo

    // Montar URL do WhatsApp
    const whatsappUrl = profile.whatsapp
        ? `https://wa.me/55${profile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
            `Olá ${name}! Vi seu perfil no PsicoNuvem e gostaria de saber sobre horários disponíveis.`
        )}`
        : null

    // Cores por tema
    const themeColors: Record<string, { bg: string; text: string; button: string }> = {
        indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', button: 'bg-indigo-600 hover:bg-indigo-700' },
        emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', button: 'bg-emerald-600 hover:bg-emerald-700' },
        rose: { bg: 'bg-rose-600', text: 'text-rose-600', button: 'bg-rose-600 hover:bg-rose-700' },
        amber: { bg: 'bg-amber-600', text: 'text-amber-600', button: 'bg-amber-600 hover:bg-amber-700' },
        cyan: { bg: 'bg-cyan-600', text: 'text-cyan-600', button: 'bg-cyan-600 hover:bg-cyan-700' },
    }
    const defaultTheme = { bg: 'bg-indigo-600', text: 'text-indigo-600', button: 'bg-indigo-600 hover:bg-indigo-700' }
    const theme = themeColors[profile.themeColor] ?? defaultTheme

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className={`${theme.bg} px-4 py-16 text-white`}>
                <div className="mx-auto max-w-2xl text-center">
                    {/* Avatar */}
                    {photo ? (
                        <img
                            src={photo}
                            alt={name}
                            className="mx-auto mb-6 h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                        />
                    ) : (
                        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white/20 text-4xl font-bold">
                            {name.charAt(0)}
                        </div>
                    )}

                    {/* Nome e CRP */}
                    <h1 className="text-3xl font-bold">{name}</h1>
                    {crp && (
                        <p className="mt-1 text-white/80">CRP: {crp}</p>
                    )}

                    {/* Título Hero */}
                    {profile.heroTitle && (
                        <p className="mt-3 text-xl font-medium text-white/90">
                            {profile.heroTitle}
                        </p>
                    )}

                    {/* Botão Principal */}
                    {whatsappUrl && (
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-green-600"
                        >
                            <MessageCircle className="h-6 w-6" />
                            Agendar Consulta
                        </a>
                    )}
                </div>
            </div>

            {/* Conteúdo */}
            <div className="mx-auto max-w-2xl px-4 py-12">
                {/* Especialidades */}
                {specialties.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Especialidades
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {specialties.map((spec) => (
                                <span
                                    key={spec}
                                    className={`rounded-full ${theme.bg} px-4 py-1.5 text-sm font-medium text-white`}
                                >
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bio */}
                {profile.bio && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Sobre Mim
                        </h2>
                        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {profile.bio}
                        </p>
                    </div>
                )}

                {/* Como Funciona */}
                <div className="mb-8 rounded-xl bg-white p-6 shadow">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        Como Funciona
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="text-center">
                            <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${theme.bg} text-white text-lg font-bold`}>
                                1
                            </div>
                            <p className="text-sm text-gray-600">
                                Entre em contato pelo WhatsApp
                            </p>
                        </div>
                        <div className="text-center">
                            <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${theme.bg} text-white text-lg font-bold`}>
                                2
                            </div>
                            <p className="text-sm text-gray-600">
                                Agendamos o melhor horário
                            </p>
                        </div>
                        <div className="text-center">
                            <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${theme.bg} text-white text-lg font-bold`}>
                                3
                            </div>
                            <p className="text-sm text-gray-600">
                                Inicie sua jornada terapêutica
                            </p>
                        </div>
                    </div>
                </div>

                {/* Endereço */}
                {profile.address && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Localização
                        </h2>
                        <div className="flex items-start gap-3 text-gray-700">
                            <MapPin className={`h-5 w-5 flex-shrink-0 ${theme.text}`} />
                            <p>{profile.address}</p>
                        </div>
                        {profile.mapUrl && (
                            <a
                                href={profile.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`mt-2 inline-flex items-center text-sm font-medium ${theme.text}`}
                            >
                                Ver no mapa →
                            </a>
                        )}
                    </div>
                )}

                {/* Redes Sociais */}
                <div className="flex justify-center gap-4">
                    {profile.instagram && (
                        <a
                            href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-gray-100 p-3 text-gray-600 transition-colors hover:bg-gray-200"
                        >
                            <Instagram className="h-6 w-6" />
                        </a>
                    )}
                    {profile.linkedin && (
                        <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-gray-100 p-3 text-gray-600 transition-colors hover:bg-gray-200"
                        >
                            <Linkedin className="h-6 w-6" />
                        </a>
                    )}
                    {profile.whatsapp && (
                        <a
                            href={whatsappUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-green-100 p-3 text-green-600 transition-colors hover:bg-green-200"
                        >
                            <Phone className="h-6 w-6" />
                        </a>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-6 text-center">
                <p className="text-sm text-gray-500">
                    Powered by{' '}
                    <Link href="/" className={`font-medium ${theme.text}`}>
                        PsicoNuvem
                    </Link>
                </p>
            </footer>
        </div>
    )
}
