import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AjustesClient from '@/components/ajustes/AjustesClient'

// ─── Tipo de perfil ───────────────────────────────────────────────────────────

export interface Perfil {
  id: string
  nombre: string | null
  carrera: string | null
  universidad: string | null
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function AjustesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('id, nombre, carrera, universidad')
    .eq('id', user.id)
    .single()

  return (
    <AjustesClient
      perfil={perfil as Perfil | null}
      email={user.email ?? ''}
    />
  )
}
