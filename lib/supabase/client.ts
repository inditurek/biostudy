import { createBrowserClient } from '@supabase/ssr'

// Usar este cliente en componentes con "use client" que necesiten
// acceder a Supabase desde el navegador (por ejemplo, listeners en tiempo real)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
