'use client'

import { cn } from '@/lib/utils'
import type { PasoGuia } from '@/lib/guia/tipos'
import { TECNICA_CONFIG } from '@/lib/guia/planes'

interface Props {
  paso: PasoGuia
  completado: boolean
  onToggle: (pasoId: string, newValue: boolean) => void
}

export default function PasoItem({ paso, completado, onToggle }: Props) {
  const tecnica = TECNICA_CONFIG[paso.tecnica]

  return (
    <div
      onClick={() => onToggle(paso.id, !completado)}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-all',
        completado
          ? 'border-green-200 bg-green-50'
          : 'border-brand-100 bg-white hover:border-brand-300 hover:bg-brand-50'
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all',
          completado ? 'border-green-500 bg-green-500' : 'border-brand-200'
        )}
      >
        {completado && (
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={cn(
              'text-[13px] font-semibold',
              completado ? 'text-gray-400 line-through' : 'text-brand-900'
            )}
          >
            {paso.titulo}
          </span>
          <span className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-px text-[10px] font-semibold text-gray-500">
            ⏱ {paso.duracion}
          </span>
        </div>
        <p
          className={cn(
            'text-[11px] leading-relaxed',
            completado ? 'text-gray-400' : 'text-gray-500'
          )}
        >
          {paso.descripcion}
        </p>
        <span
          className={cn(
            'mt-1.5 inline-block rounded-full px-2 py-px text-[10px] font-semibold',
            tecnica.bgClass,
            tecnica.textClass
          )}
        >
          {tecnica.label}
        </span>
      </div>
    </div>
  )
}
