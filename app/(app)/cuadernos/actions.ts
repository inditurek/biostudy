'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ─── Cuadernos ────────────────────────────────────────────────────────────────

export async function crearCuaderno(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre = (formData.get('nombre') as string).trim()
  const color = formData.get('color') as string

  if (!nombre) throw new Error('El nombre es requerido')

  // Calcular el siguiente orden
  const { count } = await supabase
    .from('cuadernos')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', user.id)

  const { error } = await supabase.from('cuadernos').insert({
    usuario_id: user.id,
    nombre,
    color: color || '#7c3aed',
    orden: count ?? 0,
  })

  if (error) throw new Error(`Error al crear cuaderno: ${error.message}`)

  revalidatePath('/cuadernos')
}

export async function editarCuaderno(id: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre = (formData.get('nombre') as string).trim()
  const color = formData.get('color') as string

  if (!nombre) throw new Error('El nombre es requerido')

  const { error } = await supabase
    .from('cuadernos')
    .update({ nombre, color })
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) throw new Error(`Error al editar cuaderno: ${error.message}`)

  revalidatePath('/cuadernos')
  revalidatePath(`/cuadernos/${id}`)
}

export async function eliminarCuaderno(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('cuadernos')
    .delete()
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) throw new Error(`Error al eliminar cuaderno: ${error.message}`)

  revalidatePath('/cuadernos')
}

// ─── Separadores ──────────────────────────────────────────────────────────────

export async function crearSeparador(cuadernoId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre = (formData.get('nombre') as string).trim()
  const color = formData.get('color') as string

  if (!nombre) throw new Error('El nombre es requerido')

  // Verificar que el cuaderno pertenece al usuario
  const { data: cuaderno } = await supabase
    .from('cuadernos')
    .select('id')
    .eq('id', cuadernoId)
    .eq('usuario_id', user.id)
    .single()

  if (!cuaderno) throw new Error('Cuaderno no encontrado')

  // Calcular el siguiente orden
  const { count } = await supabase
    .from('separadores')
    .select('id', { count: 'exact', head: true })
    .eq('cuaderno_id', cuadernoId)

  const { error } = await supabase.from('separadores').insert({
    cuaderno_id: cuadernoId,
    nombre,
    color: color || '#7c3aed',
    orden: count ?? 0,
  })

  if (error) throw new Error(`Error al crear separador: ${error.message}`)

  revalidatePath(`/cuadernos/${cuadernoId}`)
}

export async function editarSeparador(id: string, cuadernoId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre = (formData.get('nombre') as string).trim()
  const color = formData.get('color') as string

  if (!nombre) throw new Error('El nombre es requerido')

  const { error } = await supabase
    .from('separadores')
    .update({ nombre, color })
    .eq('id', id)

  if (error) throw new Error(`Error al editar separador: ${error.message}`)

  revalidatePath(`/cuadernos/${cuadernoId}`)
}

export async function eliminarSeparador(id: string, cuadernoId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('separadores')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Error al eliminar separador: ${error.message}`)

  revalidatePath(`/cuadernos/${cuadernoId}`)
}
