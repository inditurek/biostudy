'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Cuaderno } from '@/lib/supabase/types'

interface NotebookCardProps {
  cuaderno: Cuaderno
  separadoresCount: number
  onEdit: () => void
  onDelete: () => void
}

function gradiente(color: string): string {
  const dark = oscurecer(color)
  return `linear-gradient(160deg, ${dark}, ${color})`
}

function oscurecer(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const factor = 0.6
  const rd = Math.round(r * factor).toString(16).padStart(2, '0')
  const gd = Math.round(g * factor).toString(16).padStart(2, '0')
  const bd = Math.round(b * factor).toString(16).padStart(2, '0')
  return `#${rd}${gd}${bd}`
}

export default function NotebookCard({ cuaderno, separadoresCount, onEdit, onDelete }: NotebookCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative group">
      <Link
        href={`/cuadernos/${cuaderno.id}`}
        className="block cursor-pointer"
      >
        {/* Libro */}
        <div
          className="relative flex h-[220px] flex-col justify-end overflow-hidden rounded-sm rounded-r-xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:-rotate-1 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
          style={{ background: gradiente(cuaderno.color) }}
        >
          {/* Lomo */}
          <div className="absolute left-0 top-0 bottom-0 w-3 rounded-l-sm bg-black/15" />

          {/* Círculo decorativo */}
          <div className="absolute right-4 top-5 h-10 w-10 rounded-full border-2 border-white/20" />

          {/* Líneas decorativas */}
          <div className="absolute left-7 top-6 flex flex-col gap-2 opacity-15">
            <div className="h-0.5 w-20 rounded-sm bg-white" />
            <div className="h-0.5 w-14 rounded-sm bg-white" />
            <div className="h-0.5 w-10 rounded-sm bg-white" />
          </div>

          {/* Badge estado */}
          <span className="absolute right-3 top-3 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            En curso
          </span>

          {/* Ícono */}
          <div className="relative z-10 mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          {/* Nombre */}
          <p className="relative z-10 font-fraunces text-[15px] font-semibold leading-tight text-white">
            {cuaderno.nombre}
          </p>

          {/* Meta */}
          <p className="relative z-10 mt-1 text-[11px] font-normal text-white/70">
            {separadoresCount === 0
              ? 'Sin separadores'
              : `${separadoresCount} separador${separadoresCount !== 1 ? 'es' : ''}`}
          </p>
        </div>
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
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/50"
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
