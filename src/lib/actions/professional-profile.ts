'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentPsychologistId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export interface ProfessionalProfileDTO {
    id: string
    psychologistId: string
    slug: string
    heroTitle: string | null
    bio: string | null
    themeColor: string
    whatsapp: string | null
    instagram: string | null
    linkedin: string | null
    address: string | null
    mapUrl: string | null
    psychologist: {
        name: string
        crp: string
        photo: string | null
        specialties: string[]
    } | null
}

/**
 * Busca perfil profissional pelo slug (público).
 */
export async function getProfileBySlug(slug: string): Promise<ProfessionalProfileDTO | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ProfessionalProfile')
        .select(`
            *,
            psychologist:Psychologist(id, crp, photo, specialties)
        `)
        .eq('slug', slug)
        .single()

    if (error || !data) {
        return null
    }

    // Buscar nome do psicólogo via auth.users
    const psychologist = data.psychologist as { id: string; crp: string; photo: string | null; specialties: string[] } | null
    let name = 'Psicólogo'

    if (psychologist) {
        const { data: userData } = await supabase.auth.admin.getUserById(psychologist.id)
        if (userData?.user?.user_metadata?.full_name) {
            name = userData.user.user_metadata.full_name
        }
    }

    return {
        id: data.id,
        psychologistId: data.psychologistId,
        slug: data.slug,
        heroTitle: data.heroTitle,
        bio: data.bio,
        themeColor: data.themeColor || 'indigo',
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        linkedin: data.linkedin,
        address: data.address,
        mapUrl: data.mapUrl,
        psychologist: psychologist ? {
            name,
            crp: psychologist.crp,
            photo: psychologist.photo,
            specialties: psychologist.specialties || [],
        } : null,
    }
}

/**
 * Busca perfil do psicólogo logado.
 */
export async function getMyProfile(): Promise<ProfessionalProfileDTO | null> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ProfessionalProfile')
        .select('*')
        .eq('psychologistId', psychologistId)
        .single()

    if (error || !data) {
        return null
    }

    return {
        id: data.id,
        psychologistId: data.psychologistId,
        slug: data.slug,
        heroTitle: data.heroTitle,
        bio: data.bio,
        themeColor: data.themeColor || 'indigo',
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        linkedin: data.linkedin,
        address: data.address,
        mapUrl: data.mapUrl,
        psychologist: null,
    }
}

/**
 * Cria ou atualiza o perfil profissional.
 */
export async function upsertProfile(input: {
    slug: string
    heroTitle?: string
    bio?: string
    themeColor?: string
    whatsapp?: string
    instagram?: string
    linkedin?: string
    address?: string
    mapUrl?: string
}): Promise<{ success: boolean; error?: string }> {
    const psychologistId = await getCurrentPsychologistId()
    const supabase = await createClient()

    // Verificar se já existe
    const { data: existing } = await supabase
        .from('ProfessionalProfile')
        .select('id')
        .eq('psychologistId', psychologistId)
        .single()

    if (existing) {
        // Atualizar
        const { error } = await supabase
            .from('ProfessionalProfile')
            .update({
                slug: input.slug,
                heroTitle: input.heroTitle || null,
                bio: input.bio || null,
                themeColor: input.themeColor || 'indigo',
                whatsapp: input.whatsapp || null,
                instagram: input.instagram || null,
                linkedin: input.linkedin || null,
                address: input.address || null,
                mapUrl: input.mapUrl || null,
                updatedAt: new Date().toISOString(),
            })
            .eq('id', existing.id)

        if (error) {
            return { success: false, error: error.message }
        }
    } else {
        // Criar
        const { error } = await supabase
            .from('ProfessionalProfile')
            .insert({
                psychologistId,
                slug: input.slug,
                heroTitle: input.heroTitle || null,
                bio: input.bio || null,
                themeColor: input.themeColor || 'indigo',
                whatsapp: input.whatsapp || null,
                instagram: input.instagram || null,
                linkedin: input.linkedin || null,
                address: input.address || null,
                mapUrl: input.mapUrl || null,
            })

        if (error) {
            if (error.code === '23505') {
                return { success: false, error: 'Este slug já está em uso. Escolha outro.' }
            }
            return { success: false, error: error.message }
        }
    }

    revalidatePath('/dashboard/marketing/pagina')
    revalidatePath(`/p/${input.slug}`)
    return { success: true }
}
