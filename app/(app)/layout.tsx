import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Layout protegido: todas las rutas dentro de (app) requieren autenticación.
// Si el usuario no está logueado, el middleware lo redirige a /login antes
// de que este layout llegue a ejecutarse — pero lo verificamos acá también
// como segunda capa de seguridad.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Segunda verificación: si por alguna razón el middleware no redirigió
  if (!user) {
    redirect('/login')
  }

  return (
    // En fases siguientes este layout tendrá el sidebar y la navegación.
    // Por ahora es un contenedor simple.
    <div className="min-h-screen bg-brand-50">
      {children}
    </div>
  )
}
