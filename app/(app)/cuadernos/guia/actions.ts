'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ModoGuia, DuracionSprint } from '@/lib/supabase/types'

export interface ProgresoGuiaRow {
  id: string
  separador_id: string
  modo: ModoGuia
  duracion_sprint: DuracionSprint | null
  bloque_actual: string
  pasos_completados: string[]
  fecha_inicio: string
  updated_at: string
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function cargarProgresoGuia(
  separadorId: string
): Promise<ProgresoGuiaRow | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('progreso_guia')
    .select('*')
    .eq('separador_id', separadorId)
    .maybeSingle()

  return (data as ProgresoGuiaRow) ?? null
}

// ── Initialize (upsert on first use) ─────────────────────────────────────────

export async function inicializarProgreso(
  separadorId: string,
  modo: ModoGuia,
  duracionSprint: DuracionSprint | null
): Promise<{ ok: boolean; data?: ProgresoGuiaRow; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('progreso_guia')
    .upsert(
      {
        separador_id: separadorId,
        modo,
        duracion_sprint: duracionSprint,
        bloque_actual: '',
        pasos_completados: [],
      },
      { onConflict: 'separador_id' }
    )
    .select()
    .single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: data as ProgresoGuiaRow }
}

// ── Toggle a single paso ──────────────────────────────────────────────────────

export async function togglePasoCompletado(
  separadorId: string,
  pasoId: string,
  completado: boolean
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: row } = await supabase
    .from('progreso_guia')
    .select('pasos_completados')
    .eq('separador_id', separadorId)
    .single()

  if (!row) return { ok: false, error: 'Progreso no encontrado' }

  const current: string[] = row.pasos_completados ?? []
  const updated = completado
    ? Array.from(new Set([...current, pasoId]))
    : current.filter((id: string) => id !== pasoId)

  const { error } = await supabase
    .from('progreso_guia')
    .update({ pasos_completados: updated })
    .eq('separador_id', separadorId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// ── Change mode (resets progress) ────────────────────────────────────────────

export async function cambiarModo(
  separadorId: string,
  modo: ModoGuia,
  duracionSprint: DuracionSprint | null
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('progreso_guia')
    .update({
      modo,
      duracion_sprint: duracionSprint,
      bloque_actual: '',
      pasos_completados: [],
    })
    .eq('separador_id', separadorId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// ── Reset progress ────────────────────────────────────────────────────────────

export async function reiniciarProgreso(
  separadorId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('progreso_guia')
    .update({ bloque_actual: '', pasos_completados: [] })
    .eq('separador_id', separadorId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
