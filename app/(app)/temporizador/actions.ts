'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PresetFoco } from '@/lib/supabase/types'

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export interface StatsFoco {
  hoy: number           // minutos de foco completados hoy
  semana: number        // minutos de foco esta semana (últimos 7 días)
  racha: number         // días consecutivos con al menos 1 sesión completada
  topMaterias: { materiaId: string; nombre: string; minutos: number }[]
}

// ─── guardarSesion ────────────────────────────────────────────────────────────

export async function guardarSesion(
  duracionMin: number,
  preset: PresetFoco,
  materiaId: string | null,
  completada: boolean,
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoy = new Date().toISOString().slice(0, 10)

  const { error } = await supabase.from('sesiones_foco').insert({
    usuario_id: user.id,
    fecha: hoy,
    duracion_min: duracionMin,
    preset,
    materia_id: materiaId ?? null,
    completada,
  })

  if (error) throw new Error(`Error al guardar sesión: ${error.message}`)

  revalidatePath('/temporizador')
  revalidatePath('/')
}

// ─── cargarStatsFoco ──────────────────────────────────────────────────────────

export async function cargarStatsFoco(): Promise<StatsFoco> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoy = new Date()
  const hoyStr = hoy.toISOString().slice(0, 10)

  // Últimos 60 días para calcular racha y semana
  const hace60 = new Date(hoy)
  hace60.setDate(hace60.getDate() - 60)
  const hace60Str = hace60.toISOString().slice(0, 10)

  const { data: sesiones } = await supabase
    .from('sesiones_foco')
    .select('fecha, duracion_min, completada, materia_id, materias(nombre)')
    .eq('usuario_id', user.id)
    .gte('fecha', hace60Str)
    .order('fecha', { ascending: false })

  const rows = sesiones ?? []

  // ── Hoy ───────────────────────────────────────────────────────────────────
  const hoyMin = rows
    .filter(r => r.fecha === hoyStr && r.completada)
    .reduce((acc, r) => acc + r.duracion_min, 0)

  // ── Semana (últimos 7 días incluyendo hoy) ────────────────────────────────
  const hace7 = new Date(hoy)
  hace7.setDate(hace7.getDate() - 6)
  const hace7Str = hace7.toISOString().slice(0, 10)
  const semanaMin = rows
    .filter(r => r.fecha >= hace7Str && r.completada)
    .reduce((acc, r) => acc + r.duracion_min, 0)

  // ── Racha (días consecutivos terminando hoy con al menos 1 sesión completa) ─
  const diasConSesion = new Set(
    rows.filter(r => r.completada).map(r => r.fecha)
  )

  let racha = 0
  const cursor = new Date(hoy)
  while (true) {
    const dayStr = cursor.toISOString().slice(0, 10)
    if (diasConSesion.has(dayStr)) {
      racha++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  // ── Top materias (últimos 30 días) ────────────────────────────────────────
  const hace30 = new Date(hoy)
  hace30.setDate(hace30.getDate() - 30)
  const hace30Str = hace30.toISOString().slice(0, 10)

  const materiaMap: Record<string, { nombre: string; minutos: number }> = {}
  for (const r of rows) {
    if (!r.materia_id || r.fecha < hace30Str || !r.completada) continue
    const matNombre = (r.materias as unknown as { nombre: string } | null)?.nombre ?? 'Sin nombre'
    if (!materiaMap[r.materia_id]) {
      materiaMap[r.materia_id] = { nombre: matNombre, minutos: 0 }
    }
    materiaMap[r.materia_id].minutos += r.duracion_min
  }

  const topMaterias = Object.entries(materiaMap)
    .map(([materiaId, { nombre, minutos }]) => ({ materiaId, nombre, minutos }))
    .sort((a, b) => b.minutos - a.minutos)
    .slice(0, 5)

  return { hoy: hoyMin, semana: semanaMin, racha, topMaterias }
}
