import { describe, it, expect, beforeAll } from 'vitest'
import { encrypt, decrypt } from '@/lib/encryption'

// Mock da variável de ambiente para testes
beforeAll(() => {
  process.env.ENCRYPTION_KEY =
    '3d4f8a2b1c9e6d5a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a'
})

describe('Encryption', () => {
  it('should encrypt and decrypt text correctly', () => {
    const original = 'Paciente relata ansiedade persistente nas últimas semanas.'

    const encrypted = encrypt(original)
    expect(encrypted).not.toBe(original)
    expect(encrypted).toContain(':') // formato iv:authTag:ciphertext

    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(original)
  })

  it('should generate different ciphertexts for same input (random IV)', () => {
    const text = 'Mesmo conteúdo'

    const encrypted1 = encrypt(text)
    const encrypted2 = encrypt(text)

    // IVs diferentes = ciphertexts diferentes
    expect(encrypted1).not.toBe(encrypted2)

    // Mas ambos descriptografam para o mesmo texto
    expect(decrypt(encrypted1)).toBe(text)
    expect(decrypt(encrypted2)).toBe(text)
  })

  it('should handle unicode characters (português)', () => {
    const text = 'Sessão com João: emoções, ação, coração'

    const encrypted = encrypt(text)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(text)
  })

  it('should handle long clinical notes', () => {
    const longNote = 'A'.repeat(10000)

    const encrypted = encrypt(longNote)
    const decrypted = decrypt(encrypted)

    expect(decrypted).toBe(longNote)
  })

  it('should throw error on tampered ciphertext', () => {
    const encrypted = encrypt('Texto original')

    // Modificar ciphertext (trocar último caractere)
    const tampered = encrypted.slice(0, -1) + 'x'

    expect(() => decrypt(tampered)).toThrow()
  })
})