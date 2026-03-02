import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Este Route Handler procesa el callback del Magic Link.
// Cuando el usuario hace clic en el enlace del email, Supabase redirige acá
// con un código temporal que intercambiamos por una sesión real.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Sesión creada exitosamente → redirigir a la app
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Si algo falló, redirigir al login con un mensaje de error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
