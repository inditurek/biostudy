'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TipoEvento, RecurrenciaEvento } from '@/lib/supabase/types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface EventoRow {
  id:              string
  titulo:          string
  tipo:            TipoEvento
  fecha:           string         // 'YYYY-MM-DD' — primera ocurrencia si recurrente
  hora_inicio:     string | null
  hora_fin:        string | null
  todo_el_dia:     boolean
  locacion:        string | null
  descripcion:     string | null
  recurrencia:     RecurrenciaEvento
  recurrencia_fin: string | null  // 'YYYY-MM-DD'
}

export interface TodoRow {
  id:         string
  texto:      string
  completado: boolean
  categoria:  string
  fecha:      string | null
  orden:      number
}

export interface EventoInput {
  titulo:          string
  tipo:            TipoEvento
  fecha:           string
  hora_inicio:     string | null
  hora_fin:        string | null
  todo_el_dia:     boolean
  locacion:        string | null
  descripcion:     string | null
  recurrencia:     RecurrenciaEvento
  recurrencia_fin: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const EVENTO_SELECT = 'id, titulo, tipo, fecha, hora_inicio, hora_fin, todo_el_dia, locacion, descripcion, recurrencia, recurrencia_fin'

// ── Eventos — lectura ─────────────────────────────────────────────────────────

export async function cargarEventosMes(
  year:  number,
  month: number   // 0-based
): Promise<EventoRow[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const desde   = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const hasta   = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  // Dos queries en paralelo:
  // 1. Eventos únicos en este mes
  // 2. Eventos recurrentes que empezaron en o antes de fin de mes
  const [q1, q2] = await Promise.all([
    supabase
      .from('eventos')
      .select(EVENTO_SELECT)
      .eq('usuario_id', user.id)
      .eq('recurrencia', 'ninguna')
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('hora_inicio', { ascending: true }),

    supabase
      .from('eventos')
      .select(EVENTO_SELECT)
      .eq('usuario_id', user.id)
      .neq('recurrencia', 'ninguna')
      .lte('fecha', hasta),   // empezaron antes o durante el mes
  ])

  const regular    = (q1.data ?? []) as EventoRow[]
  const recurrentes = (q2.data ?? []) as EventoRow[]

  // Filtrar recurrentes que ya terminaron antes del mes actual
  const recurrentesActivos = recurrentes.filter(ev => {
    if (!ev.recurrencia_fin) return true
    return ev.recurrencia_fin >= desde  // terminan en o después del inicio del mes
  })

  return [...regular, ...recurrentesActivos]
}

// ── Eventos — mutaciones ──────────────────────────────────────────────────────

export async function crearEvento(
  input: EventoInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('eventos').insert({
    usuario_id:      user.id,
    titulo:          input.titulo.trim(),
    tipo:            input.tipo,
    fecha:           input.fecha,
    hora_inicio:     input.todo_el_dia ? null : (input.hora_inicio || null),
    hora_fin:        input.todo_el_dia ? null : (input.hora_fin || null),
    todo_el_dia:     input.todo_el_dia,
    locacion:        input.locacion?.trim() || null,
    descripcion:     input.descripcion?.trim() || null,
    recurrencia:     input.recurrencia,
    recurrencia_fin: input.recurrencia === 'ninguna' ? null : (input.recurrencia_fin || null),
  })

  if (error) return { ok: false, error: error.message }
  revalidatePath('/calendario')
  return { ok: true }
}

export async function editarEvento(
  id:    string,
  input: EventoInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Extraer el id base en caso de que sea una ocurrencia virtual (id__fecha)
  const baseId = id.includes('__') ? id.split('__')[0] : id

  const { error } = await supabase
    .from('eventos')
    .update({
      titulo:          input.titulo.trim(),
      tipo:            input.tipo,
      fecha:           input.fecha,
      hora_inicio:     input.todo_el_dia ? null : (input.hora_inicio || null),
      hora_fin:        input.todo_el_dia ? null : (input.hora_fin || null),
      todo_el_dia:     input.todo_el_dia,
      locacion:        input.locacion?.trim() || null,
      descripcion:     input.descripcion?.trim() || null,
      recurrencia:     input.recurrencia,
      recurrencia_fin: input.recurrencia === 'ninguna' ? null : (input.recurrencia_fin || null),
    })
    .eq('id', baseId)
    .eq('usuario_id', user.id)

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

  // Extraer id base (en caso de ocurrencia virtual de evento recurrente)
  const baseId = id.includes('__') ? id.split('__')[0] : id

  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', baseId)
    .eq('usuario_id', user.id)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/calendario')
  return { ok: true }
}

// ── Todos — lectura ───────────────────────────────────────────────────────────

export async function cargarTodosFecha(
  fecha: string
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

export async function editarTodo(
  id:    string,
  texto: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('todos')
    .update({ texto: texto.trim() })
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function toggleTodo(
  id:         string,
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
