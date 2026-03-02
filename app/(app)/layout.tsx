import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Segunda verificación de auth (el middleware ya lo hace, esto es redundancia)
  if (!user) {
    redirect('/login')
  }

  // Si el usuario no tiene perfil creado, es su primera vez → onboarding
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!perfil) {
    redirect('/onboarding')
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar />
      <main className="ml-[72px] flex-1">
        {children}
      </main>
    </div>
  )
}
