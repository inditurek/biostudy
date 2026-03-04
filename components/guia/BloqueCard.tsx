'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { BloqueGuia } from '@/lib/guia/tipos'
import PasoItem from './PasoItem'

interface Props {
  bloque: BloqueGuia
  index: number
  pasosCompletados: Set<string>
  onTogglePaso: (pasoId: string, newValue: boolean) => void
}

export default function BloqueCard({ bloque, index, pasosCompletados, onTogglePaso }: Props) {
  const [open, setOpen] = useState(index === 0)

  const done = bloque.pasos.filter(p => pasosCompletados.has(p.id)).length
  const total = bloque.pasos.length

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-brand-50"
      >
        {/* Number badge */}
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl font-fraunces text-[15px] font-bold text-white"
          style={{ background: bloque.color }}
        >
          {index + 1}
        </div>

        {/* Title group */}
        <div className="min-w-0 flex-1">
          <p className="font-fraunces text-[15px] font-semibold text-brand-900">{bloque.titulo}</p>
          <p className="mt-0.5 text-[11px] text-gray-500">{bloque.subtitulo}</p>
        </div>

        {/* Progress counter */}
        <span className="flex-shrink-0 text-[11px] font-semibold text-gray-400">
          {done}/{total}
        </span>

        {/* Chevron */}
        <svg
          className={cn(
            'h-4 w-4 flex-shrink-0 text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="border-t border-brand-50 px-5 pb-4 pt-3">
          <div className="flex flex-col gap-2.5">
            {bloque.pasos.map(paso => (
              <PasoItem
                key={paso.id}
                paso={paso}
                completado={pasosCompletados.has(paso.id)}
                onToggle={onTogglePaso}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
