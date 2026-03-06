'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { EstadoMateria } from '@/lib/supabase/types'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface NotasInput {
  p1:            number | null
  p2:            number | null
  recuperatorio: number | null
  cursada:       number | null
  final:         number | null
}

// ─── Guardar notas de una materia ─────────────────────────────────────────────

export async function guardarNotas(
  materiaId: string,
  estado:    EstadoMateria,
  notas:     NotasInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Actualizar estado de la materia
  const { error: estadoError } = await supabase
    .from('materias')
    .update({ estado })
    .eq('id', materiaId)
    .eq('usuario_id', user.id)   // seguridad: sólo la materia del usuario

  if (estadoError) {
    const msg = estadoError.message.includes('estado_valido')
      ? `El estado "${estado}" no está habilitado en la base de datos. Corré la migración SQL en Supabase.`
      : estadoError.message
    return { ok: false, error: msg }
  }

  // 2. Guardar notas: SELECT → INSERT o UPDATE
  const { data: existente, error: selectError } = await supabase
    .from('notas_materia')
    .select('id')
    .eq('materia_id', materiaId)
    .maybeSingle()

  if (selectError) return { ok: false, error: selectError.message }

  if (existente) {
    const { error: updateError } = await supabase
      .from('notas_materia')
      .update(notas)
      .eq('id', existente.id)
    if (updateError) return { ok: false, error: updateError.message }
  } else {
    const { error: insertError } = await supabase
      .from('notas_materia')
      .insert({ materia_id: materiaId, ...notas })
    if (insertError) return { ok: false, error: insertError.message }
  }

  revalidatePath('/historial')
  return { ok: true }
}

// ─── Agregar materia nueva ────────────────────────────────────────────────────

export interface AgregarMateriaInput {
  nombre:       string
  anio:         number
  cuatrimestre: 1 | 2
  estado:       EstadoMateria
  notas:        NotasInput
}

export async function agregarMateria(
  input: AgregarMateriaInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { nombre, anio, cuatrimestre, estado, notas } = input

  if (!nombre.trim() || !anio || !cuatrimestre) {
    return { ok: false, error: 'Datos incompletos' }
  }

  const { data: materia, error: insertMateriaError } = await supabase
    .from('materias')
    .insert({ usuario_id: user.id, nombre: nombre.trim(), anio, cuatrimestre, estado })
    .select('id')
    .single()

  if (insertMateriaError) return { ok: false, error: insertMateriaError.message }

  // Si hay al menos una nota, insertar el registro
  const hayNotas = Object.values(notas).some(v => v !== null)
  if (hayNotas) {
    const { error: insertNotasError } = await supabase
      .from('notas_materia')
      .insert({ materia_id: materia.id, ...notas })
    if (insertNotasError) return { ok: false, error: insertNotasError.message }
  }

  revalidatePath('/historial')
  return { ok: true }
}

// ─── Cargar plan inicial desde seed ──────────────────────────────────────────

export async function cargarMateriasAction(): Promise<void> {
  const { cargarMateriasIniciales } = await import('@/lib/data/cargar-materias')
  await cargarMateriasIniciales()
  revalidatePath('/historial')
}

// ─── Eliminar materia ─────────────────────────────────────────────────────────

export async function eliminarMateria(
  materiaId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Eliminar notas asociadas primero (por si no hay CASCADE en la migración)
  await supabase.from('notas_materia').delete().eq('materia_id', materiaId)
  await supabase.from('sesiones_foco').delete().eq('materia_id', materiaId)

  const { error } = await supabase
    .from('materias')
    .delete()
    .eq('id', materiaId)
    .eq('usuario_id', user.id)   // seguridad: sólo materias propias

  if (error) return { ok: false, error: error.message }

  revalidatePath('/historial')
  revalidatePath('/')
  return { ok: true }
}

// ─── Cargar plan personalizado (CSV) ─────────────────────────────────────────
// Formato por línea: Nombre;Año;Cuatrimestre;Estado(opcional)
// Ejemplo:           Cálculo I;1;1;aprobada

export async function cargarPlanPersonalizado(
  texto: string
): Promise<{ ok: boolean; importadas: number; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const estadosValidos: EstadoMateria[] = [
    'pendiente', 'cursando', 'aprobada', 'promocionada', 'libre', 'final_pendiente',
  ]

  const lineas = texto
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))

  if (lineas.length === 0) {
    return { ok: false, importadas: 0, error: 'El texto no contiene materias válidas.' }
  }

  let importadas = 0
  const errores: string[] = []

  for (const linea of lineas) {
    const partes = linea.split(';').map((p) => p.trim())
    if (partes.length < 3) {
      errores.push(`Formato inválido: "${linea}" (necesita al menos Nombre;Año;Cuatrimestre)`)
      continue
    }

    const nombre      = partes[0]
    const anio        = parseInt(partes[1])
    const cuatrimestre = parseInt(partes[2])
    const estadoRaw   = (partes[3] ?? '').toLowerCase()
    const estado: EstadoMateria = estadosValidos.includes(estadoRaw as EstadoMateria)
      ? (estadoRaw as EstadoMateria)
      : 'pendiente'

    if (!nombre || isNaN(anio) || anio < 1 || anio > 10 || ![1, 2].includes(cuatrimestre)) {
      errores.push(`Datos inválidos en: "${linea}"`)
      continue
    }

    const { error } = await supabase.from('materias').insert({
      usuario_id: user.id,
      nombre,
      anio,
      cuatrimestre: cuatrimestre as 1 | 2,
      estado,
    })

    if (error) {
      errores.push(`Error en "${nombre}": ${error.message}`)
    } else {
      importadas++
    }
  }

  revalidatePath('/historial')
  revalidatePath('/')

  if (importadas === 0) {
    return { ok: false, importadas: 0, error: errores.join('\n') }
  }
  return { ok: true, importadas }
}
