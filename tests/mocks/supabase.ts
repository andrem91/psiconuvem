/**
 * Mock factory para Supabase client em testes de integração.
 * Permite simular respostas do banco de dados sem conexão real.
 */
import { vi } from 'vitest'

// Tipo genérico para respostas do Supabase
type SupabaseResponse<T> = {
    data: T | null
    error: { message: string; code: string } | null
}

// Builder para encadear métodos do Supabase
export function createMockQueryBuilder<T>(response: SupabaseResponse<T>) {
    const builder = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(response),
        // Para queries que não usam single()
        then: vi.fn((resolve) => resolve(response)),
    }

    // Faz os métodos retornarem a promise diretamente quando necessário
    Object.defineProperty(builder, 'then', {
        value: (resolve: (value: SupabaseResponse<T>) => void) => {
            resolve(response)
            return Promise.resolve(response)
        },
    })

    return builder
}

// Mock do Supabase client completo
export function createMockSupabaseClient<T>(tableResponses: Record<string, SupabaseResponse<T>>) {
    return {
        from: vi.fn((table: string) => {
            const response = tableResponses[table] || { data: null, error: null }
            return createMockQueryBuilder(response)
        }),
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id', email: 'test@test.com' } },
                error: null,
            }),
            signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
            signOut: vi.fn().mockResolvedValue({ error: null }),
        },
    }
}

// Dados de teste padrão
export const mockPatient = {
    id: 'patient-123',
    psychologistId: 'psychologist-123',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999998888',
    birthdate: '1990-05-15',
    lgpdConsent: true,
    lgpdConsentDate: '2024-01-01T10:00:00Z',
    lgpdConsentIp: '127.0.0.1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    deletedAt: null,
}

export const mockAppointment = {
    id: 'appointment-123',
    psychologistId: 'psychologist-123',
    patientId: 'patient-123',
    scheduledAt: '2024-03-15T10:00:00Z',
    duration: 50,
    type: 'online',
    status: 'SCHEDULED',
    notes: null,
    sessionPrice: 200,
    paymentStatus: 'PENDING',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    deletedAt: null,
}

export const mockPsychologist = {
    id: 'psychologist-123',
    userId: 'user-123',
    email: 'psicologo@email.com',
    name: 'Dr. Maria Santos',
    crp: '06/12345',
    createdAt: '2024-01-01T10:00:00Z',
}
