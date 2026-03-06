import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AnioData, CuatriData, HistorialStats, MateriaConNotas } from '@/components/historial/types'
import type { Materia, NotaMateria } from '@/lib/supabase/types'
import StatsBar from '@/components/historial/StatsBar'
import HistorialToggle from '@/components/historial/HistorialToggle'
import HistorialEmptyState from '@/components/historial/HistorialEmptyState'

// ── Helpers de cálculo ──────────────────────────────────────────────────────

function promedioDe(numeros: (number | null)[]): number | null {
  const validos = numeros.filter((n): n is number => n !== null)
  if (validos.length === 0) return null
  return validos.reduce((a, b) => a + b, 0) / validos.length
}

function notaPrincipal(m: MateriaConNotas): number | null {
  // Para el promedio: nota final si existe, sino cursada
  if (m.notas?.final !== null && m.notas?.final !== undefined) return m.notas.final
  if (m.notas?.cursada !== null && m.notas?.cursada !== undefined) return m.notas.cursada
  return null
}

// ── Tipo del row que devuelve Supabase (materia + notas anidadas) ─────────────

type MateriaRow = Materia & { notas_materia: NotaMateria[] }

// ── Página ──────────────────────────────────────────────────────────────────

export default async function HistorialPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Traer materias + notas en una sola query
  const { data: rawMaterias, error: queryError } = await supabase
    .from('materias')
    .select('*, notas_materia(*)')
    .eq('usuario_id', user.id)
    .order('anio', { ascending: true })
    .order('cuatrimestre', { ascending: true })
    .order('nombre', { ascending: true })

  // Si la query falla (ej: tablas no existen en producción), mostrar error claro
  if (queryError) {
    console.error('[historial] Error al cargar materias:', queryError)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 p-8">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 px-8 py-10 text-center">
          <p className="font-fraunces text-lg font-semibold text-red-700">Error al cargar el historial</p>
          <p className="mt-2 text-sm text-red-600">
            {queryError.message || 'No se pudo conectar con la base de datos.'}
          </p>
          <p className="mt-4 text-xs text-red-400">
            Verificá que las tablas estén creadas en Supabase y que las variables de entorno estén configuradas en Vercel.
          </p>
        </div>
      </div>
    )
  }

  // Aplanar: quitar el array notas_materia y exponer el primer elemento como `notas`
  const materias: MateriaConNotas[] = ((rawMaterias ?? []) as MateriaRow[]).map(
    (row): MateriaConNotas => {
      const { notas_materia, ...materiaBase } = row
      return { ...materiaBase, notas: (notas_materia ?? [])[0] ?? null }
    }
  )

  const sinMaterias = materias.length === 0

  // ── Stats globales ──────────────────────────────────────────────────────
  const stats: HistorialStats = {
    promedioGeneral: promedioDe(materias.map(notaPrincipal)),
    aprobadas:       materias.filter(m => m.estado === 'aprobada').length,
    enCurso:         materias.filter(m => m.estado === 'cursando').length,
    promocionadas:   materias.filter(m => m.estado === 'promocionada').length,
    recuperatorios:  materias.filter(
      m => m.notas?.recuperatorio !== null && m.notas?.recuperatorio !== undefined
    ).length,
    total: materias.length,
  }

  // ── Agrupar por año → cuatrimestre (sin iterar Maps) ──────────────────
  const aniosMapa: Record<number, Record<1 | 2, MateriaConNotas[]>> = {}

  for (const m of materias) {
    const a = m.anio
    const c = m.cuatrimestre as 1 | 2
    if (!aniosMapa[a]) aniosMapa[a] = {} as Record<1 | 2, MateriaConNotas[]>
    if (!aniosMapa[a][c]) aniosMapa[a][c] = []
    aniosMapa[a][c].push(m)
  }

  const anios: AnioData[] = Object.keys(aniosMapa)
    .map(Number)
    .sort((a, b) => a - b)
    .map((anioNum): AnioData => {
      const cuatrisMapa = aniosMapa[anioNum]

      const cuatrimestres: CuatriData[] = ([1, 2] as const)
        .filter(c => Boolean(cuatrisMapa[c]))
        .map((c): CuatriData => {
          const mats = cuatrisMapa[c]
          const aprobMats = mats.filter(
            m => m.estado === 'aprobada' || m.estado === 'promocionada'
          )
          return {
            cuatrimestre: c,
            materias: mats,
            promedio: promedioDe(aprobMats.map(notaPrincipal)),
          }
        })

      const todasDelAnio   = cuatrimestres.flatMap(c => c.materias)
      const aprobParaProm  = todasDelAnio.filter(
        m => m.estado === 'aprobada' || m.estado === 'promocionada'
      )

      return {
        anio: anioNum,
        cuatrimestres,
        aprobadas:    todasDelAnio.filter(m => m.estado === 'aprobada').length,
        promocionadas: todasDelAnio.filter(m => m.estado === 'promocionada').length,
        promedio:     promedioDe(aprobParaProm.map(notaPrincipal)),
      }
    })

  return (
    <div className="min-h-screen bg-brand-50 px-6 py-8 md:px-10">
      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-fraunces text-[28px] font-bold text-brand-900">
            Historial Académico 📚
          </h1>
          <p className="mt-1 text-sm text-brand-400">
            Tus notas y progreso a lo largo de la carrera.
          </p>
        </div>

        </div>

      {sinMaterias ? (
        /* ── Estado vacío ── */
        <HistorialEmptyState />
      ) : (
        <>
          {/* ── Stats ── */}
          <StatsBar stats={stats} />

          {/* ── Tabs: Historial / Correlativas ── */}
          <HistorialToggle anios={anios} />
        </>
      )}
    </div>
  )
}
