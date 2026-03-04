'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModoGuia, DuracionSprint } from '@/lib/supabase/types'
import type { PlanGuia } from '@/lib/guia/tipos'

interface Props {
  plan: PlanGuia
  modo: ModoGuia
  duracion: DuracionSprint | null
  completados: Set<string>
  onReset: () => void
}

const REFERENCIA = [
  { situacion: 'Después de cada clase',  label: 'Cursada',   cls: 'bg-brand-100 text-brand-600' },
  { situacion: '3–7 días después',        label: 'Cursada',   cls: 'bg-brand-100 text-brand-600' },
  { situacion: 'Parcial en 3 semanas',    label: 'Examen',    cls: 'bg-orange-100 text-orange-600' },
  { situacion: 'Parcial en 1–2 semanas',  label: 'Examen',    cls: 'bg-orange-100 text-orange-600' },
  { situacion: 'Parcial en 7 días',       label: 'Sprint 7d', cls: 'bg-red-100 text-red-600' },
  { situacion: 'Parcial en 4 días',       label: 'Sprint 4d', cls: 'bg-red-100 text-red-600' },
  { situacion: 'Parcial mañana pasado',   label: 'Sprint 2d', cls: 'bg-red-100 text-red-600' },
]

const TECNICAS = [
  { name: '🧠 Active Recall',  desc: 'Recordar sin mirar. El esfuerzo de recuperar es lo que consolida.' },
  { name: '📅 Espaciado',      desc: 'Sesiones distribuidas en el tiempo valen más que un maratón.' },
  { name: '🔗 Elaboración',    desc: 'Conectar lo nuevo con lo que ya sabés. Más conexiones = más retención.' },
  { name: '📋 Simulacro',      desc: 'Practicar en condiciones reales antes del parcial real.' },
]

const CHECKLIST_EXAMEN = [
  'Hice el inventario y no quedan temas en 🔴',
  'Hice al menos 1 simulacro completo en condiciones reales',
  'Sé qué tipo de preguntas suele tomar el docente',
  'Tengo claros los conceptos que más se interconectan',
  'Dormí bien las últimas 2 noches',
]

function ChecklistExamen() {
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST_EXAMEN.map(() => false))

  function toggle(i: number) {
    setChecked(prev => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
      <h3 className="mb-3 font-fraunces text-[15px] font-semibold text-brand-900">
        Checklist pre-parcial
      </h3>
      <div className="flex flex-col">
        {CHECKLIST_EXAMEN.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className="flex items-start gap-2.5 border-b border-brand-50 py-2.5 text-left transition last:border-b-0 hover:bg-brand-50 rounded-lg px-1"
          >
            <div
              className={cn(
                'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] border-2',
                checked[i] ? 'border-green-500 bg-green-500' : 'border-brand-200'
              )}
            >
              {checked[i] && (
                <svg
                  className="h-2.5 w-2.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <p
              className={cn(
                'text-[12px] leading-snug',
                checked[i] ? 'text-gray-400 line-through' : 'text-brand-900'
              )}
            >
              {item}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ProgressPanel({ plan, modo, duracion, completados, onReset }: Props) {
  const totalPasos = plan.bloques.reduce((sum, b) => sum + b.pasos.length, 0)
  const completadosCount = plan.bloques.reduce(
    (sum, b) => sum + b.pasos.filter(p => completados.has(p.id)).length,
    0
  )
  const pct = totalPasos > 0 ? Math.round((completadosCount / totalPasos) * 100) : 0

  const modoLabel =
    modo === 'cursada' ? 'Cursada' : modo === 'examen' ? 'Examen' : `Sprint ${duracion}d`
  const barGradient =
    modo === 'cursada'
      ? 'from-brand-600 to-brand-500'
      : modo === 'examen'
        ? 'from-orange-600 to-orange-500'
        : 'from-red-600 to-red-500'

  return (
    <div className="flex flex-col gap-3.5">
      {/* Progress box */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
        <h3 className="mb-4 font-fraunces text-[15px] font-semibold text-brand-900">Tu progreso</h3>
        <div className="mb-2 flex justify-between text-[12px]">
          <span className="text-gray-500">Pasos completados</span>
          <span className="font-bold text-brand-900">
            {completadosCount} / {totalPasos}
          </span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all', barGradient)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-gray-500">Modo activo</span>
          <span className="font-bold text-brand-900">{modoLabel}</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="mt-4 w-full rounded-xl border border-brand-100 py-2 text-[12px] font-medium text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          Reiniciar progreso
        </button>
      </div>

      {/* Quick reference */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
        <h3 className="mb-3 font-fraunces text-[15px] font-semibold text-brand-900">
          Referencia rápida
        </h3>
        <div className="flex flex-col gap-0.5">
          {REFERENCIA.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12px] transition hover:bg-brand-50"
            >
              <span className="font-medium text-brand-900">{r.situacion}</span>
              <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold', r.cls)}>
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-exam checklist (only in examen mode) */}
      {modo === 'examen' && <ChecklistExamen />}

      {/* Techniques reference */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
        <h3 className="mb-3 font-fraunces text-[15px] font-semibold text-brand-900">
          Técnicas usadas
        </h3>
        <div className="flex flex-col divide-y divide-brand-50">
          {TECNICAS.map(t => (
            <div key={t.name} className="py-2.5">
              <p className="text-[12px] font-bold text-brand-900">{t.name}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
