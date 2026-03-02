'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { AnioData } from './types'
import YearCard from './YearCard'
import CorrelativasGrid from './CorrelativasGrid'

interface HistorialToggleProps {
  anios: AnioData[]
}

type Vista = 'historial' | 'correlativas'

export default function HistorialToggle({ anios }: HistorialToggleProps) {
  const [vista, setVista] = useState<Vista>('historial')

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

      {/* ── Vista: Historial ── */}
      {vista === 'historial' && (
        <div className="flex flex-col gap-4">
          {anios.map((data) => (
            <YearCard
              key={data.anio}
              data={data}
              defaultOpen={enCursoAnio?.anio === data.anio}
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
  )
}
