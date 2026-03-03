'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TipoEvento } from '@/lib/supabase/types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface EventoRow {
  id:          string
  titulo:      string
  tipo:        TipoEvento
  fecha:       string        // 'YYYY-MM-DD'
  hora_inicio: string | null // 'HH:MM'
  hora_fin:    string | null
  todo_el_dia: boolean
}

export interface TodoRow {
  id:         string
  texto:      string
  completado: boolean
  categoria:  string
  fecha:      string | null
  orden:      number
}

export interface CrearEventoInput {
  titulo:      string
  tipo:        TipoEvento
  fecha:       string
  hora_inicio: string | null
  hora_fin:    string | null
  todo_el_dia: boolean
}

// ── Eventos — lectura ─────────────────────────────────────────────────────────

export async function cargarEventosMes(
  year: number,
  month: number   // 0-based (0 = enero)
): Promise<EventoRow[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Rango del mes completo
  const desde = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const hasta = new Date(year, month + 1, 0)  // último día del mes
  const hastaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(hasta.getDate()).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('eventos')
    .select('id, titulo, tipo, fecha, hora_inicio, hora_fin, todo_el_dia')
    .eq('usuario_id', user.id)
    .gte('fecha', desde)
    .lte('fecha', hastaStr)
    .order('hora_inicio', { ascending: true })

  if (error) return []
  return (data ?? []) as EventoRow[]
}

// ── Eventos — mutaciones ──────────────────────────────────────────────────────

export async function crearEvento(
  input: CrearEventoInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('eventos').insert({
    usuario_id:  user.id,
    titulo:      input.titulo.trim(),
    tipo:        input.tipo,
    fecha:       input.fecha,
    hora_inicio: input.hora_inicio || null,
    hora_fin:    input.hora_fin || null,
    todo_el_dia: input.todo_el_dia,
  })

  if (error) return { ok: false, error: error.message }
  revalidatePath('/calendario')
  return { ok: true }
}

export async function eliminarEvento(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/calendario')
  return { ok: true }
}

// ── Todos — lectura ───────────────────────────────────────────────────────────

export async function cargarTodosFecha(
  fecha: string  // 'YYYY-MM-DD'
): Promise<TodoRow[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('todos')
    .select('id, texto, completado, categoria, fecha, orden')
    .eq('usuario_id', user.id)
    .eq('fecha', fecha)
    .order('orden', { ascending: true })

  if (error) return []
  return (data ?? []) as TodoRow[]
}

// ── Todos — mutaciones ────────────────────────────────────────────────────────

export async function crearTodo(
  texto: string,
  fecha: string
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Calcular el siguiente orden
  const { count } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', user.id)
    .eq('fecha', fecha)

  const { data, error } = await supabase
    .from('todos')
    .insert({
      usuario_id: user.id,
      texto:      texto.trim(),
      completado: false,
      categoria:  'general',
      fecha,
      orden:      (count ?? 0),
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }
  revalidatePath('/calendario')
  return { ok: true, id: data.id }
}

export async function toggleTodo(
  id: string,
  completado: boolean
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('todos')
    .update({ completado })
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function eliminarTodo(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/calendario')
  return { ok: true }
}
