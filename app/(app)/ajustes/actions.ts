'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ─── actualizarPerfil ─────────────────────────────────────────────────────────

export async function actualizarPerfil(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre    = (formData.get('nombre') as string | null)?.trim() ?? ''
  const carrera   = (formData.get('carrera') as string | null)?.trim() ?? ''
  const universidad = (formData.get('universidad') as string | null)?.trim() ?? ''

  const { error } = await supabase
    .from('perfiles')
    .upsert({ id: user.id, nombre, carrera, universidad }, { onConflict: 'id' })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/ajustes')
  revalidatePath('/')           // El home usa el nombre del perfil
  return { ok: true }
}

// ─── eliminarCuenta ───────────────────────────────────────────────────────────

export async function eliminarCuenta(): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const uid = user.id

  // Eliminar todos los datos del usuario en orden (las FK con CASCADE se encargan del resto)
  await supabase.from('sesiones_foco').delete().eq('usuario_id', uid)
  await supabase.from('todos').delete().eq('usuario_id', uid)
  await supabase.from('eventos').delete().eq('usuario_id', uid)
  // cuadernos tiene ON DELETE CASCADE → separadores → archivos, notas, progreso_guia
  await supabase.from('cuadernos').delete().eq('usuario_id', uid)
  await supabase.from('materias').delete().eq('usuario_id', uid)
  await supabase.from('perfiles').delete().eq('id', uid)

  // Cerrar sesión
  await supabase.auth.signOut()

  return { ok: true }
}

// ─── cerrarSesion ─────────────────────────────────────────────────────────────

export async function cerrarSesion(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
