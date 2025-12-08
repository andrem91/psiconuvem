'use client'

import { useState } from 'react'
import { upsertProfile, ProfessionalProfileDTO } from '@/lib/actions/professional-profile'
import { Save, Loader2, ExternalLink, Eye } from 'lucide-react'
import Link from 'next/link'

interface ProfileEditorProps {
    initialProfile: ProfessionalProfileDTO | null
}

const THEME_OPTIONS = [
    { value: 'indigo', label: 'Azul Índigo', color: 'bg-indigo-600' },
    { value: 'emerald', label: 'Verde Esmeralda', color: 'bg-emerald-600' },
    { value: 'rose', label: 'Rosa', color: 'bg-rose-600' },
    { value: 'amber', label: 'Âmbar', color: 'bg-amber-600' },
    { value: 'cyan', label: 'Ciano', color: 'bg-cyan-600' },
]

export function ProfileEditor({ initialProfile }: ProfileEditorProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const [formData, setFormData] = useState({
        slug: initialProfile?.slug || '',
        heroTitle: initialProfile?.heroTitle || '',
        bio: initialProfile?.bio || '',
        themeColor: initialProfile?.themeColor || 'indigo',
        whatsapp: initialProfile?.whatsapp || '',
        instagram: initialProfile?.instagram || '',
        linkedin: initialProfile?.linkedin || '',
        address: initialProfile?.address || '',
        mapUrl: initialProfile?.mapUrl || '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)

        const result = await upsertProfile(formData)

        if (result.success) {
            setMessage({ type: 'success', text: 'Perfil salvo com sucesso!' })
        } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao salvar' })
        }

        setIsSaving(false)
    }

    const previewUrl = formData.slug ? `/p/${formData.slug}` : null

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensagem de status */}
            {message && (
                <div
                    className={`rounded-lg p-4 ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* URL do perfil */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    URL do seu perfil *
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">psiconuvem.com/p/</span>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="dra-maria-silva"
                        required
                        pattern="[a-z0-9-]+"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {previewUrl && (
                        <Link
                            href={previewUrl}
                            target="_blank"
                            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100"
                        >
                            <Eye className="h-5 w-5" />
                        </Link>
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    Use apenas letras minúsculas, números e hífens.
                </p>
            </div>

            {/* Título Hero */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Título de Destaque
                </label>
                <input
                    type="text"
                    name="heroTitle"
                    value={formData.heroTitle}
                    onChange={handleChange}
                    placeholder="Psicóloga Clínica | Especialista em Ansiedade"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Bio */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Sobre Você
                </label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Conte um pouco sobre sua formação, abordagem terapêutica e como você trabalha..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Cor do Tema */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Cor do Tema
                </label>
                <div className="flex gap-3">
                    {THEME_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, themeColor: opt.value })}
                            className={`h-10 w-10 rounded-full ${opt.color} ${formData.themeColor === opt.value
                                    ? 'ring-4 ring-offset-2 ring-gray-400'
                                    : ''
                                }`}
                            title={opt.label}
                        />
                    ))}
                </div>
            </div>

            {/* Contato */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        WhatsApp
                    </label>
                    <input
                        type="text"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="11999999999"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Instagram
                    </label>
                    <input
                        type="text"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        placeholder="@seuusuario"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Localização */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Endereço
                </label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Salvar Perfil
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
