'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Separador } from '@/lib/supabase/types'

interface SeparadorCardProps {
  separador: Separador
  cuadernoId: string
  archivosCount: number
  onEdit: () => void
  onDelete: () => void
}

export default function SeparadorCard({ separador, cuadernoId, archivosCount, onEdit, onDelete }: SeparadorCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative group">
      <Link
        href={`/cuadernos/${cuadernoId}/${separador.id}`}
        className="block rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_10px_24px_rgba(91,45,158,0.12)]"
      >
        {/* Tab de color */}
        <div
          className="mb-3 h-1 w-10 rounded-full"
          style={{ background: separador.color }}
        />

        {/* Nombre */}
        <p className="text-sm font-semibold leading-snug text-brand-900">
          {separador.nombre}
        </p>

        {/* Meta */}
        <p className="mt-2 text-xs text-brand-300">
          {archivosCount === 0
            ? 'Sin archivos'
            : `${archivosCount} archivo${archivosCount !== 1 ? 's' : ''}`}
        </p>
      </Link>

      {/* Menú ⋯ */}
      <div
        className="absolute right-2 top-2 z-10"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-100 bg-white text-brand-300 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:border-brand-300 hover:text-brand-600"
          title="Opciones"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 w-36 overflow-hidden rounded-xl border border-brand-100 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); setMenuOpen(false); onEdit() }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-brand-900 transition-colors hover:bg-brand-50"
            >
              <svg className="h-3.5 w-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); setMenuOpen(false); onDelete() }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
