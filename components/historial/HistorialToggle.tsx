'use client'

import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { AnioData, CuatriData, MateriaConNotas } from './types'
import type { Materia, NotaMateria } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'
import YearCard from './YearCard'
import CorrelativasGrid from './CorrelativasGrid'

interface HistorialToggleProps {
  anios: AnioData[]
}

type Vista = 'historial' | 'correlativas'

// ── Helpers ───────────────────────────────────────────────────────────────────

type MateriaRow = Materia & { notas_materia: NotaMateria[] }

function promedioDe(nums: (number | null)[]): number | null {
  const validos = nums.filter((n): n is number => n !== null)
  if (validos.length === 0) return null
  return validos.reduce((a, b) => a + b, 0) / validos.length
}

function notaPrincipal(m: MateriaConNotas): number | null {
  if (m.notas?.final != null) return m.notas.final
  if (m.notas?.cursada != null) return m.notas.cursada
  return null
}

function buildAniosFromRaw(rawMaterias: MateriaRow[]): AnioData[] {
  const materias: MateriaConNotas[] = rawMaterias.map(row => {
    const { notas_materia, ...materiaBase } = row
    return { ...materiaBase, notas: (notas_materia ?? [])[0] ?? null }
  })

  const aniosMapa: Record<number, Record<1 | 2, MateriaConNotas[]>> = {}
  for (const m of materias) {
    const a = m.anio
    const c = m.cuatrimestre as 1 | 2
    if (!aniosMapa[a]) aniosMapa[a] = {} as Record<1 | 2, MateriaConNotas[]>
    if (!aniosMapa[a][c]) aniosMapa[a][c] = []
    aniosMapa[a][c].push(m)
  }

  return Object.keys(aniosMapa)
    .map(Number)
    .sort((a, b) => a - b)
    .map(anioNum => {
      const cuatrisMapa = aniosMapa[anioNum]
      const cuatrimestres: CuatriData[] = ([1, 2] as const)
        .filter(c => Boolean(cuatrisMapa[c]))
        .map(c => {
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

      const todasDelAnio  = cuatrimestres.flatMap(c => c.materias)
      const aprobParaProm = todasDelAnio.filter(
        m => m.estado === 'aprobada' || m.estado === 'promocionada'
      )

      return {
        anio: anioNum,
        cuatrimestres,
        aprobadas:     todasDelAnio.filter(m => m.estado === 'aprobada').length,
        promocionadas: todasDelAnio.filter(m => m.estado === 'promocionada').length,
        promedio:      promedioDe(aprobParaProm.map(notaPrincipal)),
      }
    })
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function HistorialToggle({ anios: initialAnios }: HistorialToggleProps) {
  const [vista, setVista] = useState<Vista>('historial')
  const [anios, setAnios] = useState<AnioData[]>(initialAnios)
  const [loading, setLoading] = useState(initialAnios.length === 0)

  /**
   * Consulta materias + notas_materia directo desde Supabase (browser client).
   * Se llama al montar y después de cada guardado para asegurar datos frescos.
   */
  const refreshAnios = useCallback(async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: rawMaterias, error } = await supabase
      .from('materias')
      .select('*, notas_materia(*)')
      .eq('usuario_id', user.id)
      .order('anio',         { ascending: true })
      .order('cuatrimestre', { ascending: true })
      .order('nombre',       { ascending: true })

    if (error) {
      console.error('[HistorialToggle] error al cargar notas:', error)
      return
    }

    if (rawMaterias) {
      setAnios(buildAniosFromRaw(rawMaterias as MateriaRow[]))
    }
  }, [])

  // Al montar: traer notas frescas desde la DB; nada se renderiza hasta tenerlas
  useEffect(() => {
    refreshAnios().finally(() => setLoading(false))
  }, [refreshAnios])

  const enCursoAnio = anios.find(a =>
    a.cuatrimestres.some(c => c.materias.some(m => m.estado === 'cursando'))
  )

  return (
    <>
      {/* ── Tabs ── */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setVista('historial')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
            vista === 'historial'
              ? 'bg-brand-500 text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)]'
              : 'border border-brand-200 bg-white text-brand-500 hover:bg-brand-50'
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Historial de notas
        </button>

        <button
          onClick={() => setVista('correlativas')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
            vista === 'correlativas'
              ? 'bg-brand-500 text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)]'
              : 'border border-brand-200 bg-white text-brand-500 hover:bg-brand-50'
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Mapa de correlativas
        </button>
      </div>

      {/* ── Loader visual ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-500" />
          <p className="text-sm font-medium text-brand-400">Cargando historial...</p>
        </div>
      ) : (
        <>
          {/* ── Vista: Historial ── */}
          {vista === 'historial' && (
            <div className="flex flex-col gap-4">
              {anios.map((data) => (
                <YearCard
                  key={data.anio}
                  data={data}
                  defaultOpen={enCursoAnio?.anio === data.anio}
                  onRefresh={refreshAnios}
                />
              ))}
            </div>
          )}

          {/* ── Vista: Correlativas ── */}
          {vista === 'correlativas' && (
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="mb-6">
                <h2 className="font-fraunces text-lg font-semibold text-brand-900">
                  Mapa de Correlativas 🗺️
                </h2>
                <p className="mt-1 text-sm text-brand-400">
                  Estado de tus materias por año y cuatrimestre.
                </p>
              </div>
              <CorrelativasGrid anios={anios} />
            </div>
          )}
        </>
      )}
    </>
  )
}
