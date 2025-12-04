import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Database } from '@/types/supabase'

// Definimos o tipo de perfil de psicólogo para melhor tipagem
type PsychologistProfile = Database['public']['Tables']['Psychologist']['Row']

/**
 * Retorna o psicólogo logado (perfil completo) ou redireciona para login.
 * Usar em Server Components e Server Actions.
 */
export async function getCurrentPsychologist(): Promise<PsychologistProfile> {
    const supabase = await createClient()

    // 1. Verificar a sessão de autenticação do usuário
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Se não houver usuário logado, redireciona.
        redirect('/login')
    }

    // 2. Buscar o perfil do psicólogo na tabela 'Psychologist'
    const { data: psychologist, error } = await supabase
        .from('Psychologist')
        .select('*')
        .eq('userId', user.id) // userId na tabela Psychologist é o ID do auth.users
        .single()
    
    if (error || !psychologist) {
        // Se houver erro ou o perfil não existir, redireciona (usuário órfão)
        console.error("Perfil de psicólogo não encontrado ou erro:", error?.message)
        redirect('/login') 
    }

    return psychologist
}

/**
 * Retorna apenas o ID do psicólogo (ID do Tenant)
 * Usar quando só precisa do ID para as queries do CRUD
 */
export async function getCurrentPsychologistId(): Promise<string> {
    const psychologist = await getCurrentPsychologist()
    
    // O ID da tabela Psychologist é o nosso Tenant ID
    return psychologist.id
}