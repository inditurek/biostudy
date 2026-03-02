'use server'

// Carga el plan de materias inicial para un usuario.
// Se llama una sola vez desde la pantalla de Historial cuando el usuario
// todavía no tiene materias cargadas.

import { createClient } from '@/lib/supabase/server'
import { MATERIAS_SEED } from './materias-seed'

export async function cargarMateriasIniciales(): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'No autenticado' }

  // Verificar que no tenga materias cargadas ya
  const { count } = await supabase
    .from('materias')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', user.id)

  if (count && count > 0) {
    return { ok: false, error: 'Ya tenés materias cargadas' }
  }

  // Insertar todas las materias y sus notas en secuencia
  for (const item of MATERIAS_SEED) {
    const { data: materia, error: errMateria } = await supabase
      .from('materias')
      .insert({ ...item.materia, usuario_id: user.id })
      .select('id')
      .single()

    if (errMateria || !materia) {
      return { ok: false, error: `Error al insertar ${item.materia.nombre}: ${errMateria?.message}` }
    }

    if (item.notas) {
      const { error: errNotas } = await supabase
        .from('notas_materia')
        .insert({ ...item.notas, materia_id: materia.id })

      if (errNotas) {
        return { ok: false, error: `Error al insertar notas de ${item.materia.nombre}: ${errNotas.message}` }
      }
    }
  }

  return { ok: true }
}
