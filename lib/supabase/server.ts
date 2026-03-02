import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Usar este cliente en Server Components y Route Handlers.
// Nunca importarlo en archivos con "use client" — expone cookies del servidor.
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // En Server Components no se pueden setear cookies.
            // El middleware se encarga de refrescar la sesión.
          }
        },
      },
    }
  )
}
