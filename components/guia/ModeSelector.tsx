'use client'

import { cn } from '@/lib/utils'
import type { ModoGuia } from '@/lib/supabase/types'

interface ModeOption {
  value: ModoGuia
  icon: string
  titulo: string
  desc: string
  tag: string
  borderCls: string
  bgCls: string
  ringCls: string
  tagBgCls: string
  tagTextCls: string
}

const MODES: ModeOption[] = [
  {
    value: 'cursada',
    icon: '📘',
    titulo: 'Cursada',
    desc: 'Para usar semana a semana después de cada clase. Tres bloques espaciados para consolidar sin agobiarte.',
    tag: 'Semana a semana',
    borderCls: 'border-brand-500',
    bgCls: 'bg-brand-50',
    ringCls: 'ring-brand-500/20',
    tagBgCls: 'bg-brand-100',
    tagTextCls: 'text-brand-600',
  },
  {
    value: 'examen',
    icon: '📝',
    titulo: 'Examen',
    desc: 'Para activar 2–3 semanas antes del parcial. Diagnóstico, práctica intensiva y simulacros reales.',
    tag: '2–3 semanas antes',
    borderCls: 'border-orange-500',
    bgCls: 'bg-orange-50',
    ringCls: 'ring-orange-500/20',
    tagBgCls: 'bg-orange-100',
    tagTextCls: 'text-orange-600',
  },
  {
    value: 'sprint',
    icon: '🏃',
    titulo: 'Sprint',
    desc: 'Para cuando el tiempo apremia. Planes quirúrgicos de 7, 4 o 2 días con priorización por peso.',
    tag: 'Días contados',
    borderCls: 'border-red-500',
    bgCls: 'bg-red-50',
    ringCls: 'ring-red-500/20',
    tagBgCls: 'bg-red-100',
    tagTextCls: 'text-red-600',
  },
]

interface Props {
  modoActual: ModoGuia
  onSelect: (modo: ModoGuia) => void
}

export default function ModeSelector({ modoActual, onSelect }: Props) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
        Seleccioná el modo según el momento del cuatrimestre
      </p>
      <div className="grid grid-cols-3 gap-3.5">
        {MODES.map(m => {
          const isSelected = modoActual === m.value
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onSelect(m.value)}
              className={cn(
                'flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                isSelected
                  ? `${m.borderCls} ${m.bgCls} ring-4 ${m.ringCls}`
                  : 'border-brand-100 bg-white'
              )}
            >
              <span className="mb-2.5 text-[26px]">{m.icon}</span>
              <p className="font-fraunces text-[16px] font-semibold text-brand-900">{m.titulo}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-gray-500">{m.desc}</p>
              <span
                className={cn(
                  'mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  isSelected ? `${m.tagBgCls} ${m.tagTextCls}` : 'bg-gray-100 text-gray-500'
                )}
              >
                {m.tag}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
