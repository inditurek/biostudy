'use client'

import { useState, useTransition } from 'react'
import type { Cuaderno, Separador } from '@/lib/supabase/types'
import SeparadorCard from './SeparadorCard'
import NuevoCuadernoModal from './NuevoCuadernoModal'
import NuevoSeparadorModal from './NuevoSeparadorModal'
import { eliminarSeparador } from '@/app/(app)/cuadernos/actions'

// ── gradiente mini (igual que en la page) ────────────────────────────────────
function gradienteMini(color: string): string {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const f = 0.6
  const dark = `#${Math.round(r * f).toString(16).padStart(2, '0')}${Math.round(g * f).toString(16).padStart(2, '0')}${Math.round(b * f).toString(16).padStart(2, '0')}`
  return `linear-gradient(160deg, ${dark}, ${color})`
}

interface Props {
  cuaderno: Cuaderno
  separadores: Separador[]
  archivosCount: Record<string, number>
}

export default function SeparadoresGrid({ cuaderno, separadores, archivosCount }: Props) {
  const [editandoCuaderno, setEditandoCuaderno] = useState(false)
  const [creandoSep, setCreandoSep] = useState(false)
  const [editandoSep, setEditandoSep] = useState<Separador | null>(null)
  const [isPending, startTransition] = useTransition()

  const sepModalOpen = creandoSep || !!editandoSep

  function handleCloseSepModal() {
    setCreandoSep(false)
    setEditandoSep(null)
  }

  function handleDeleteSep(sep: Separador) {
    if (!confirm(`¿Eliminar "${sep.nombre}" y todos sus archivos?`)) return
    startTransition(async () => {
      await eliminarSeparador(sep.id, cuaderno.id)
    })
  }

  return (
    <>
      {/* Header del cuaderno */}
      <div className="mb-8 flex items-center gap-5">
        {/* Portada mini */}
        <div
          className="relative h-[72px] w-14 flex-shrink-0 rounded-sm rounded-r-xl shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
          style={{ background: gradienteMini(cuaderno.color) }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-sm bg-black/15" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-fraunces text-[28px] font-semibold text-brand-900">
            {cuaderno.nombre}
          </h1>
          <p className="mt-1 text-sm text-brand-400">
            {separadores.length === 0
              ? 'Sin separadores'
              : `${separadores.length} separador${separadores.length !== 1 ? 'es' : ''}`}
          </p>
        </div>
        {/* Botón editar cuaderno */}
        <button
          type="button"
          onClick={() => setEditandoCuaderno(true)}
          className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-[13px] font-medium text-brand-500 transition hover:border-brand-400 hover:bg-brand-50"
          title="Editar cuaderno"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </button>
      </div>

      {/* Separadores header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-fraunces text-lg font-semibold text-brand-900">
          Separadores
        </h2>
        <button
          onClick={() => setCreandoSep(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_3px_10px_rgba(124,58,237,0.3)] transition hover:-translate-y-px hover:bg-brand-600"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo separador
        </button>
      </div>

      {/* Grid o estado vacío */}
      {separadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
            <svg className="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-fraunces text-base font-semibold text-brand-900">Sin separadores</p>
          <p className="mt-1 text-sm text-brand-400">Creá un separador para organizar el contenido del cuaderno</p>
        </div>
      ) : (
        <div
          className={isPending ? 'opacity-60 transition-opacity' : ''}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}
        >
          {separadores.map(sep => (
            <SeparadorCard
              key={sep.id}
              separador={sep}
              cuadernoId={cuaderno.id}
              archivosCount={archivosCount[sep.id] ?? 0}
              onEdit={() => setEditandoSep(sep)}
              onDelete={() => handleDeleteSep(sep)}
            />
          ))}
        </div>
      )}

      {/* Modal editar cuaderno */}
      <NuevoCuadernoModal
        open={editandoCuaderno}
        onClose={() => setEditandoCuaderno(false)}
        cuaderno={cuaderno}
      />

      {/* Modal crear / editar separador */}
      <NuevoSeparadorModal
        open={sepModalOpen}
        onClose={handleCloseSepModal}
        cuadernoId={cuaderno.id}
        separador={editandoSep ?? undefined}
      />
    </>
  )
}
