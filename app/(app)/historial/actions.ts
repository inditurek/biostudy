'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { EstadoMateria } from '@/lib/supabase/types'

// ─── Guardar notas de una materia ─────────────────────────────────────────────
// Crea el registro notas_materia si no existe, o lo actualiza.

export async function guardarNotas(materiaId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Parsear campos — vacío → null
  function parseNota(key: string): number | null {
    const val = (formData.get(key) as string | null)?.trim()
    if (!val) return null
    const n = parseFloat(val)
    return isNaN(n) ? null : n
  }

  const estado = formData.get('estado') as EstadoMateria
  const notas = {
    p1:            parseNota('p1'),
    p2:            parseNota('p2'),
    recuperatorio: parseNota('recuperatorio'),
    cursada:       parseNota('cursada'),
    final:         parseNota('final'),
  }

  // Actualizar estado de la materia
  await supabase
    .from('materias')
    .update({ estado })
    .eq('id', materiaId)

  // Upsert de notas (insert si no existe, update si existe)
  const { data: existente } = await supabase
    .from('notas_materia')
    .select('id')
    .eq('materia_id', materiaId)
    .single()

  if (existente) {
    await supabase
      .from('notas_materia')
      .update(notas)
      .eq('materia_id', materiaId)
  } else {
    await supabase
      .from('notas_materia')
      .insert({ materia_id: materiaId, ...notas })
  }

  revalidatePath('/historial')
}

// ─── Agregar materia nueva ────────────────────────────────────────────────────

export async function agregarMateria(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre = (formData.get('nombre') as string).trim()
  const anio = parseInt(formData.get('anio') as string)
  const cuatrimestre = parseInt(formData.get('cuatrimestre') as string) as 1 | 2
  const estado = (formData.get('estado') as EstadoMateria) || 'cursando'

  if (!nombre || !anio || !cuatrimestre) throw new Error('Datos incompletos')

  const { data: materia, error } = await supabase
    .from('materias')
    .insert({ usuario_id: user.id, nombre, anio, cuatrimestre, estado })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Si viene con notas, insertarlas
  function parseNota(key: string): number | null {
    const val = (formData.get(key) as string | null)?.trim()
    if (!val) return null
    const n = parseFloat(val)
    return isNaN(n) ? null : n
  }

  const p1 = parseNota('p1')
  const p2 = parseNota('p2')
  const recuperatorio = parseNota('recuperatorio')
  const cursada = parseNota('cursada')
  const final_ = parseNota('final')

  if (p1 !== null || p2 !== null || cursada !== null || final_ !== null) {
    await supabase
      .from('notas_materia')
      .insert({ materia_id: materia.id, p1, p2, recuperatorio, cursada, final: final_ })
  }

  revalidatePath('/historial')
}

// ─── Cargar plan inicial desde seed ──────────────────────────────────────────
// Wrapper void para usar en <form action={...}> (Next.js requiere Promise<void>)

export async function cargarMateriasAction(): Promise<void> {
  const { cargarMateriasIniciales } = await import('@/lib/data/cargar-materias')
  await cargarMateriasIniciales()
  revalidatePath('/historial')
}
