import { headers } from 'next/headers'

/**
 * Captura o IP do cliente a partir dos headers da requisição.
 * Suporta diferentes proxies e CDNs (x-real-ip, x-forwarded-for, Cloudflare).
 * 
 * @returns IP do cliente ou null se não encontrado
 */

const IP_HEADERS = [
  'x-real-ip',
  'x-forwarded-for',
  'cf-connecting-ip',
] as const

export async function getClientIp(): Promise<string | null> {
  const headersList = await headers()
  
  for (const header of IP_HEADERS) {
    const value = headersList.get(header)
    if (value) {
      // x-forwarded-for pode conter múltiplos IPs separados por vírgula
      return header === 'x-forwarded-for' 
        ? value.split(',')[0]?.trim() || null 
        : value
    }
  }
  
  return null
}
