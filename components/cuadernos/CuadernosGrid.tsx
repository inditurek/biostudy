'use client'

import { useTransition } from 'react'
import { useState } from 'react'
import type { Cuaderno } from '@/lib/supabase/types'
import NotebookCard from './NotebookCard'
import NuevoCuadernoModal from './NuevoCuadernoModal'
import { eliminarCuaderno } from '@/app/(app)/cuadernos/actions'

interface Props {
  cuadernos: Cuaderno[]
  separadoresCounts: Record<string, number>
}

export default function CuadernosGrid({ cuadernos, separadoresCounts }: Props) {
  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<Cuaderno | null>(null)
  const [isPending, startTransition] = useTransition()

  const modalOpen = creando || !!editando

  function handleCloseModal() {
    setCreando(false)
    setEditando(null)
  }

  function handleDelete(cuaderno: Cuaderno) {
    if (!confirm(`¿Eliminar "${cuaderno.nombre}"? Se borrarán todos sus separadores y archivos.`)) return
    startTransition(async () => {
      await eliminarCuaderno(cuaderno.id)
    })
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-fraunces text-[32px] font-semibold leading-tight text-brand-900">
            Mis Cuadernos
          </h1>
          <p className="mt-1 text-sm text-brand-400">
            {cuadernos.length === 0
              ? 'Todavía no tenés cuadernos'
              : `${cuadernos.length} cuaderno${cuadernos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setCreando(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(124,58,237,0.35)] transition hover:-translate-y-px hover:bg-brand-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo cuaderno
        </button>
      </div>

      {/* Grid o estado vacío */}
      {cuadernos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
            <svg className="h-8 w-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="font-fraunces text-lg font-semibold text-brand-900">Todavía no tenés cuadernos</p>
          <p className="mt-1 text-sm text-brand-400">Creá tu primer cuaderno para organizar tus materias</p>
        </div>
      ) : (
        <div
          className={isPending ? 'opacity-60 transition-opacity' : ''}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}
        >
          {cuadernos.map(cuaderno => (
            <NotebookCard
              key={cuaderno.id}
              cuaderno={cuaderno}
              separadoresCount={separadoresCounts[cuaderno.id] ?? 0}
              onEdit={() => setEditando(cuaderno)}
              onDelete={() => handleDelete(cuaderno)}
            />
          ))}
        </div>
      )}

      {/* Modal crear / editar */}
      <NuevoCuadernoModal
        open={modalOpen}
        onClose={handleCloseModal}
        cuaderno={editando ?? undefined}
      />
    </>
  )
}
