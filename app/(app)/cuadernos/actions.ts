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

// ─── Archivos ─────────────────────────────────────────────────────────────────

export async function guardarArchivoMetadata(
  separadorId: string,
  nombre: string,
  tipo: string,
  urlStorage: string,
  tamano: number,
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar que el separador pertenece al usuario
  const { data: sep } = await supabase
    .from('separadores')
    .select('id, cuadernos!inner(id, usuario_id)')
    .eq('id', separadorId)
    .eq('cuadernos.usuario_id', user.id)
    .single()

  if (!sep) throw new Error('Separador no encontrado')

  const cuadernoId = (sep as unknown as { id: string; cuadernos: { id: string; usuario_id: string } }).cuadernos.id

  const { error } = await supabase.from('archivos').insert({
    separador_id: separadorId,
    nombre,
    tipo,
    url_storage: urlStorage,
    tamano,
  })

  if (error) throw new Error(`Error al guardar archivo: ${error.message}`)

  revalidatePath(`/cuadernos/${cuadernoId}/${separadorId}`)
  revalidatePath(`/cuadernos/${cuadernoId}`)
}

export async function eliminarArchivo(
  archivoId: string,
  urlStorage: string,
  separadorId: string,
  cuadernoId: string,
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar que el archivo pertenece al usuario (via separador → cuaderno)
  const { data: archivo } = await supabase
    .from('archivos')
    .select('id, separadores!inner(id, cuadernos!inner(id, usuario_id))')
    .eq('id', archivoId)
    .eq('separadores.cuadernos.usuario_id', user.id)
    .single()

  if (!archivo) throw new Error('Archivo no encontrado')

  // Eliminar del Storage solo si es un archivo real (no un link externo)
  const storageMarker = '/object/public/archivos/'
  const markerIndex = urlStorage.indexOf(storageMarker)
  if (markerIndex !== -1) {
    const storagePath = urlStorage.slice(markerIndex + storageMarker.length)
    const { error: storageError } = await supabase.storage
      .from('archivos')
      .remove([storagePath])
    if (storageError) {
      // No bloquear: si el archivo ya no existe en Storage igual limpiamos DB
      console.error('Storage delete warning:', storageError.message)
    }
  }

  const { error } = await supabase.from('archivos').delete().eq('id', archivoId)
  if (error) throw new Error(`Error al eliminar archivo: ${error.message}`)

  revalidatePath(`/cuadernos/${cuadernoId}/${separadorId}`)
  revalidatePath(`/cuadernos/${cuadernoId}`)
}
