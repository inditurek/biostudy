'use client'

import { cn } from '@/lib/utils'
import type { DuracionSprint } from '@/lib/supabase/types'

const OPTIONS: { value: DuracionSprint; cuando: string }[] = [
  { value: 7, cuando: 'Empecé tarde' },
  { value: 4, cuando: 'Tiempo justo' },
  { value: 2, cuando: 'Modo pánico' },
]

interface Props {
  duracionActual: DuracionSprint
  onSelect: (d: DuracionSprint) => void
}

export default function SprintDurationPicker({ duracionActual, onSelect }: Props) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
        ¿Cuántos días tenés?
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {OPTIONS.map(opt => {
          const isActive = duracionActual === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                'flex flex-col items-center rounded-xl border-2 py-4 transition-all',
                isActive
                  ? 'border-red-500 bg-red-50'
                  : 'border-brand-100 bg-white hover:border-red-300 hover:bg-red-50'
              )}
            >
              <span className="font-fraunces text-[28px] font-bold text-red-600">{opt.value}</span>
              <span className="text-[11px] font-semibold text-gray-500">días</span>
              <span className="mt-1 text-[10px] text-gray-400">{opt.cuando}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
