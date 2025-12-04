import { headers } from 'next/headers'

/**
 * Captura o IP do cliente a partir dos headers da requisição.
 * Suporta diferentes proxies e CDNs (x-real-ip, x-forwarded-for, Cloudflare).
 * 
 * @returns IP do cliente ou null se não encontrado
 */
export async function getClientIp(): Promise<string | null> {
  const headersList = await headers()
  
  // Tentar diferentes headers (dependendo do proxy/CDN)
  const ip = 
    headersList.get('x-real-ip') ||
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('cf-connecting-ip') || // Cloudflare
    null
  
  return ip
}
