import { z } from 'zod'

// ====================================
// VALIDAÇÃO DE AUTENTICAÇÃO
// ====================================

export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  crp: z.string().regex(/^\d{2}\/\d{5,6}$/, 'CRP inválido (formato: XX/XXXXX)'),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

// ====================================
// VALIDAÇÃO DE PACIENTE
// ====================================

export const patientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  
  // Email opcional - aceita string vazia e converte para undefined
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
  // Telefone brasileiro - valida formato e remove caracteres especiais
  phone: z.string()
    .regex(
      /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
      'Telefone inválido (formato: (XX) XXXXX-XXXX)'
    )
    .transform(phone => phone.replace(/\D/g, '')), // Remove caracteres não numéricos
  
  birthdate: z.string().optional(),
  lgpdConsent: z.boolean().default(false),
})

// ====================================
// TIPOS INFERIDOS
// ====================================

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PatientInput = z.infer<typeof patientSchema>
