'use client'

import { useState, useEffect } from 'react'
import type { PresetFoco, Materia } from '@/lib/supabase/types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  minutosFoco: number
  preset: PresetFoco
  materias: Pick<Materia, 'id' | 'nombre' | 'estado'>[]
  materiaIdInicial: string
  onGuardar: (duracion: number, materiaId: string, completada: boolean) => Promise<void>
  onClose: () => void
}

// ─── Labels de preset ─────────────────────────────────────────────────────────

const PRESET_LABEL: Record<PresetFoco, string> = {
  'pomodoro':      '🍅 Pomodoro',
  'deep-work':     '🧠 Deep Work',
  'sprint-corto':  '⚡ Sprint corto',
  'personalizado': '✏️ Personalizado',
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SesionModal({
  open,
  minutosFoco,
  preset,
  materias,
  materiaIdInicial,
  onGuardar,
  onClose,
}: Props) {
  const [materiaId, setMateriaId] = useState(materiaIdInicial)
  const [guardando, setGuardando] = useState(false)

  // Sincronizar materia inicial cada vez que el modal se abre
  useEffect(() => {
    if (open) setMateriaId(materiaIdInicial)
  }, [open, materiaIdInicial])

  if (!open) return null

  const sinTiempo = minutosFoco === 0

  async function handleGuardar() {
    if (sinTiempo) {
      onClose()
      return
    }
    setGuardando(true)
    try {
      await onGuardar(minutosFoco, materiaId, true)
    } finally {
      setGuardando(false)
    }
    onClose()
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-brand-100 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

        {/* Ícono + título */}
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            {sinTiempo
              ? <span className="text-3xl">😴</span>
              : <span className="text-3xl">🎉</span>
            }
          </div>
          <h2 className="font-fraunces text-xl font-bold text-brand-900">
            {sinTiempo ? 'Sin tiempo registrado' : '¡Sesión finalizada!'}
          </h2>
          <p className="mt-1 text-sm text-brand-400">
            {sinTiempo
              ? 'No se completó ningún minuto de foco.'
              : 'Guardá tu sesión para llevar el seguimiento.'
            }
          </p>
        </div>

        {/* Stats de la sesión */}
        {!sinTiempo && (
          <div className="mb-5 flex items-center justify-between rounded-xl bg-brand-50 px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">Tiempo de foco</p>
              <p className="font-fraunces text-3xl font-bold text-brand-900">
                {minutosFoco} <span className="text-base font-medium text-brand-400">min</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">Modo</p>
              <p className="text-sm font-semibold text-brand-700">{PRESET_LABEL[preset]}</p>
            </div>
          </div>
        )}

        {/* Selector de materia */}
        {!sinTiempo && (
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold text-brand-600">
              Materia estudiada
            </label>
            <select
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-900 outline-none focus:border-brand-400"
            >
              <option value="">Sin materia</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-200 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
          >
            Descartar
          </button>
          {!sinTiempo && (
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(124,58,237,0.35)] transition hover:-translate-y-px hover:bg-brand-600 disabled:opacity-60"
            >
              {guardando ? 'Guardando…' : 'Guardar sesión'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
