'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { registerSchema, loginSchema } from '@/lib/validations/schemas'
import crypto from 'crypto'

// --- TIPOS ---

export type AuthState = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    crp?: string[]
    _form?: string[]
  }
  success?: boolean
  message?: string
}

// --- HELPERS ---

/**
 * Gera um slug único para o psicólogo
 * Faz até 10 tentativas para evitar colisões
 */
async function generateUniqueSlug(name: string, supabaseAdmin: any): Promise<string> {
  // Gerar slug base a partir do nome
  const slug = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
  
  let attempts = 0
  let finalSlug = slug
  
  // Tentar até 10 vezes encontrar um slug único
  while (attempts < 10) {
    const { data } = await supabaseAdmin
      .from('Psychologist')
      .select('id')
      .eq('slug', finalSlug)
      .single()
    
    // Se não encontrou nenhum registro, o slug está disponível
    if (!data) return finalSlug
    
    // Se já existe, adicionar um hash aleatório
    finalSlug = `${slug}-${crypto.randomBytes(4).toString('hex')}`
    attempts++
  }
  
  // Se após 10 tentativas não conseguiu, usar UUID completo
  throw new Error('Não foi possível gerar slug único após 10 tentativas')
}

// --- ACTIONS ---

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  // 1. Validação Zod
  const validatedFields = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    crp: formData.get('crp'),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { name, email, password, crp } = validatedFields.data
  
  // Cliente Normal (Auth)
  const supabase = await createClient()
  
  // Cliente Admin (Banco de Dados - Ignora RLS)
  const supabaseAdmin = createAdminClient()

  // 2. Criar Usuário no Auth
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  })

  if (authError) {
    return { errors: { _form: [authError.message] } }
  }

  if (!authData.user) {
    return { errors: { _form: ['Erro ao criar usuário no Auth. Tente novamente.'] } }
  }

  // 3. Logout preventivo (caso logue automático antes de confirmar email)
  if (authData.session) {
    await supabase.auth.signOut()
  }

  // 4. Gerar slug único
  let slug: string
  try {
    slug = await generateUniqueSlug(name, supabaseAdmin)
  } catch (error) {
    console.error('Erro ao gerar slug:', error)
    
    // Rollback: Deleta o usuário do Auth se o slug falhar
    try {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    } catch (deleteError) {
      console.error('Erro crítico ao fazer rollback (slug):', deleteError)
    }
    
    return { errors: { _form: ['Erro ao processar cadastro. Tente novamente.'] } }
  }

  // 5. Criar Perfil na tabela Psychologist (Usando Admin para ignorar RLS)
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 30)

  const { error: profileError } = await supabaseAdmin.from('Psychologist').insert({
    id: crypto.randomUUID(),
    userId: authData.user.id,
    crp,
    slug,
    plan: 'TRIAL',
    trialEndsAt: trialEndsAt.toISOString(),
    updatedAt: new Date().toISOString(),
  })

  if (profileError) {
    console.error('Erro ao criar perfil:', profileError)
    
    // Mensagem específica para CRP duplicado
    if (profileError.code === '23505' && profileError.message.includes('crp')) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('Erro ao fazer rollback (CRP duplicado):', deleteError)
      }
      return { 
        errors: { 
          crp: ['Este CRP já está cadastrado. Se você já tem uma conta, faça login.'] 
        } 
      }
    }
    
    // Rollback: Deleta o usuário do Auth se o perfil falhar
    try {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    } catch (deleteError) {
      console.error('Erro crítico ao fazer rollback (perfil):', deleteError)
    }
    
    return { errors: { _form: ['Erro ao criar perfil do psicólogo. Tente novamente.'] } }
  }

  return { 
    success: true,
    message: 'Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.' 
  }
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  })

  if (error) {
    return { errors: { _form: ['Email ou senha incorretos.'] } }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}