'use server'

import { signIn } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { AuthError } from 'next-auth'

// Schema de validação para registro
const registerSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    crp: z.string().regex(/^\d{2}\/\d{5,6}$/, 'CRP inválido (formato: XX/XXXXX)'),
})

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
})

export type AuthState = {
    errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        crp?: string[]
        _form?: string[]
    }
    success?: boolean
}

// Action de Registro
export async function register(
    prevState: AuthState,
    formData: FormData
): Promise<AuthState> {
    const validatedFields = registerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        crp: formData.get('crp'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, email, password, crp } = validatedFields.data

    try {
        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return {
                errors: { email: ['Este email já está cadastrado'] },
            }
        }

        // Verificar se CRP já existe
        const existingCrp = await prisma.psychologist.findUnique({
            where: { crp },
        })

        if (existingCrp) {
            return {
                errors: { crp: ['Este CRP já está cadastrado'] },
            }
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10)

        // Criar slug único baseado no nome
        const baseSlug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

        // Verificar se slug existe e adicionar número se necessário
        let slug = baseSlug
        let counter = 1
        while (await prisma.psychologist.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`
            counter++
        }

        // Criar usuário e psicólogo em transação
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            })

            await tx.psychologist.create({
                data: {
                    userId: user.id,
                    crp,
                    slug,
                    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
                },
            })
        })

        return { success: true }
    } catch (error) {
        console.error('Erro no registro:', error)
        return {
            errors: { _form: ['Erro ao criar conta. Tente novamente.'] },
        }
    }
}

// Action de Login
export async function login(
    prevState: AuthState,
    formData: FormData
): Promise<AuthState> {
    const validatedFields = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        await signIn('credentials', {
            email: validatedFields.data.email,
            password: validatedFields.data.password,
            redirectTo: '/dashboard',
        })

        return { success: true }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return {
                        errors: { _form: ['Email ou senha incorretos'] },
                    }
                default:
                    return {
                        errors: { _form: ['Erro ao fazer login. Tente novamente.'] },
                    }
            }
        }
        throw error // Rethrow para redirect funcionar
    }
}