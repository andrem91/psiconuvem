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
  
  // Telefone brasileiro - aceita vários formatos
  phone: z.string()
    .min(10, 'Telefone muito curto')
    .max(20, 'Telefone muito longo')
    .regex(
      /^(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4,5}-?\d{4}$|^\d{10,11}$/,
      'Telefone inválido (formato: (XX) XXXXX-XXXX ou XXXXXXXXXXX)'
    )
    .transform(phone => {
      // Remove tudo exceto dígitos
      const cleaned = phone.replace(/\D/g, '')
      // Remove código do país se presente
      return cleaned.startsWith('55') && cleaned.length > 11 ? cleaned.slice(2) : cleaned
    })
    .refine((phone) => phone.length === 10 || phone.length === 11, {
      message: 'Telefone deve ter 10 ou 11 dígitos'
    }),
  
  
  // Birthdate - valida formato e ranges realistas
  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)')
    .refine((date) => {
      const birthDate = new Date(date + 'T00:00:00.000Z') // Parse as UTC midnight
      const today = new Date()
      const minDate = new Date('1900-01-01T00:00:00.000Z')
      return birthDate <= today && birthDate >= minDate
    }, {
      message: 'Data de nascimento inválida (deve estar entre 01/01/1900 e hoje)'
    })
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
  lgpdConsent: z.boolean().default(false),
})

// ====================================
// TIPOS INFERIDOS
// ====================================

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PatientInput = z.infer<typeof patientSchema>
