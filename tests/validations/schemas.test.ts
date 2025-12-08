import { describe, it, expect } from 'vitest'
import { patientSchema, registerSchema, loginSchema } from '@/lib/validations/schemas'

describe('validation schemas', () => {
    describe('patientSchema', () => {
        describe('name field', () => {
            it('should accept valid name', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                })
                expect(result.success).toBe(true)
            })

            it('should reject name with less than 3 chars', () => {
                const result = patientSchema.safeParse({
                    name: 'Jo',
                    phone: '11999998888',
                })
                expect(result.success).toBe(false)
                if (!result.success) {
                    const nameError = result.error.issues.find(e => e.path.includes('name'))
                    expect(nameError?.message).toContain('3 caracteres')
                }
            })
        })

        describe('phone field', () => {
            it('should accept phone with 11 digits', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                })
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.data.phone).toBe('11999998888')
                }
            })

            it('should accept phone with 10 digits', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '1199998888',
                })
                expect(result.success).toBe(true)
            })

            it('should accept formatted phone (XX) XXXXX-XXXX', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '(11) 99999-8888',
                })
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.data.phone).toBe('11999998888')
                }
            })

            it('should strip +55 country code', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '+55 11 99999-8888',
                })
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.data.phone).toBe('11999998888')
                }
            })

            it('should reject phone with too few digits', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '123456',
                })
                expect(result.success).toBe(false)
            })
        })

        describe('email field (optional)', () => {
            it('should accept valid email', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                    email: 'joao@email.com',
                })
                expect(result.success).toBe(true)
            })

            it('should accept empty string (converts to undefined)', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                    email: '',
                })
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.data.email).toBeUndefined()
                }
            })

            it('should reject invalid email format', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                    email: 'invalid-email',
                })
                expect(result.success).toBe(false)
            })
        })

        describe('birthdate field (optional)', () => {
            it('should accept valid date YYYY-MM-DD', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                    birthdate: '1990-05-15',
                })
                expect(result.success).toBe(true)
            })

            it('should reject future date', () => {
                const futureDate = new Date()
                futureDate.setFullYear(futureDate.getFullYear() + 1)
                const futureDateStr = futureDate.toISOString().split('T')[0]

                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                    birthdate: futureDateStr,
                })
                expect(result.success).toBe(false)
            })

            it('should reject date before 1900', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                    birthdate: '1899-12-31',
                })
                expect(result.success).toBe(false)
            })

            it('should accept empty string (converts to undefined)', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                    birthdate: '',
                })
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.data.birthdate).toBeUndefined()
                }
            })
        })

        describe('lgpdConsent field', () => {
            it('should default to false', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                })
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.data.lgpdConsent).toBe(false)
                }
            })

            it('should accept true', () => {
                const result = patientSchema.safeParse({
                    name: 'João Silva',
                    phone: '11999998888',
                    lgpdConsent: true,
                })
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.data.lgpdConsent).toBe(true)
                }
            })
        })
    })

    describe('registerSchema', () => {
        const validData = {
            name: 'Dr. João Silva',
            email: 'joao@psicologo.com',
            password: 'senha123',
            crp: '06/12345',
        }

        it('should accept valid registration data', () => {
            const result = registerSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should validate CRP format XX/XXXXX', () => {
            const result = registerSchema.safeParse({
                ...validData,
                crp: '06/12345',
            })
            expect(result.success).toBe(true)
        })

        it('should validate CRP format XX/XXXXXX', () => {
            const result = registerSchema.safeParse({
                ...validData,
                crp: '06/123456',
            })
            expect(result.success).toBe(true)
        })

        it('should reject invalid CRP format', () => {
            const result = registerSchema.safeParse({
                ...validData,
                crp: 'invalid',
            })
            expect(result.success).toBe(false)
        })

        it('should reject password less than 6 chars', () => {
            const result = registerSchema.safeParse({
                ...validData,
                password: '12345',
            })
            expect(result.success).toBe(false)
        })
    })

    describe('loginSchema', () => {
        it('should accept valid login data', () => {
            const result = loginSchema.safeParse({
                email: 'joao@email.com',
                password: 'senha123',
            })
            expect(result.success).toBe(true)
        })

        it('should reject invalid email', () => {
            const result = loginSchema.safeParse({
                email: 'invalid',
                password: 'senha123',
            })
            expect(result.success).toBe(false)
        })

        it('should reject empty password', () => {
            const result = loginSchema.safeParse({
                email: 'joao@email.com',
                password: '',
            })
            expect(result.success).toBe(false)
        })
    })
})
