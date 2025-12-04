import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Se houve erro do Supabase (ex: link expirado)
  if (error) {
    console.error('Auth callback error:', error, error_description)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description || error)}`
    )
  }

  // Troca o code por uma sessão
  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Sucesso! Redireciona para o dashboard (ou next)
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Error exchanging code for session:', exchangeError)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Erro ao confirmar email. Tente novamente.')}`
    )
  }

  // Sem code = acesso direto inválido
  return NextResponse.redirect(`${origin}/login`)
}