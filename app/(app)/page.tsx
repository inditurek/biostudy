import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cargarStatsFoco } from '@/app/(app)/temporizador/actions'
import HomeClient from '@/components/home/HomeClient'
import type { Materia, NotaMateria, Todo, Evento } from '@/lib/supabase/types'

// ─── Tipos internos ────────────────────────────────────────────────────────────

type MateriaConNotas = Materia & { notas_materia: NotaMateria[] }

export interface MateriasStats {
  promedio: number | null
  aprobadas: number
  total: number
  cursando: number
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoy = new Date().toISOString().slice(0, 10)

  // Fetch en paralelo
  const [
    { data: materiasRaw },
    { data: todosRaw },
    { data: eventosRaw },
    { data: perfil },
    stats,
  ] = await Promise.all([
    supabase
      .from('materias')
      .select('*, notas_materia(*)')
      .eq('usuario_id', user.id)
      .order('anio')
      .order('cuatrimestre'),
    supabase
      .from('todos')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('fecha', hoy)
      .order('orden'),
    supabase
      .from('eventos')
      .select('*')
      .eq('usuario_id', user.id)
      .gte('fecha', hoy)
      .order('fecha')
      .order('hora_inicio')
      .limit(5),
    supabase
      .from('perfiles')
      .select('nombre')
      .eq('id', user.id)
      .single(),
    cargarStatsFoco(),
  ])

  const materias = (materiasRaw ?? []) as MateriaConNotas[]
  const todos    = (todosRaw ?? []) as Todo[]
  const eventos  = (eventosRaw ?? []) as Evento[]
  const nombre   = perfil?.nombre ?? user.email?.split('@')[0] ?? 'estudiante'

  // Calcular stats de materias server-side
  const aprobadas = materias.filter(
    (m) => m.estado === 'aprobada' || m.estado === 'promocionada'
  ).length

  const total = materias.length

  const cursando = materias.filter(
    (m) => m.estado === 'cursando' || m.estado === 'final_pendiente'
  ).length

  const conNota = materias.filter((m) => {
    const nota = m.notas_materia?.[0]
    return nota && nota.final !== null
  })

  const promedio =
    conNota.length > 0
      ? conNota.reduce((acc, m) => acc + (m.notas_materia[0].final ?? 0), 0) /
        conNota.length
      : null

  const materiasStats: MateriasStats = { promedio, aprobadas, total, cursando }

  return (
    <HomeClient
      nombre={nombre}
      todosIniciales={todos}
      eventosProximos={eventos}
      stats={stats}
      materiasStats={materiasStats}
      fechaHoy={hoy}
    />
  )
}
