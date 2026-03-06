'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EditMateriaModal from './EditMateriaModal'
import CargarPlanModal from './CargarPlanModal'

// ─── Componente ───────────────────────────────────────────────────────────────

export default function HistorialEmptyState() {
  const router = useRouter()
  const [showAgregar, setShowAgregar] = useState(false)
  const [showPlan, setShowPlan] = useState(false)

  async function handleRefresh() {
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white px-8 py-24 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {/* Ícono */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
          <svg className="h-8 w-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <h2 className="font-fraunces text-xl font-semibold text-brand-900">
          Todavía no hay materias
        </h2>
        <p className="mt-2 max-w-md text-sm text-brand-400">
          Podés agregar tus materias una por una o subir el plan completo de tu carrera de una sola vez.
        </p>

        {/* Botones */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={() => setShowAgregar(true)}
            className="flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-6 py-2.5 text-sm font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar manualmente
          </button>
          <button
            onClick={() => setShowPlan(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition hover:-translate-y-px hover:bg-brand-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Subir mi plan
          </button>
        </div>
      </div>

      {/* Modal: agregar una materia */}
      {showAgregar && (
        <EditMateriaModal
          open={true}
          onClose={() => setShowAgregar(false)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Modal: subir plan CSV */}
      {showPlan && (
        <CargarPlanModal
          open={true}
          onClose={() => setShowPlan(false)}
          onRefresh={handleRefresh}
        />
      )}
    </>
  )
}
