'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { crearEvento } from '@/app/(app)/calendario/actions'

type TipoEvento = 'clase' | 'parcial' | 'tarea' | 'personal' | 'sprint'

const TIPOS: { value: TipoEvento; label: string; dot: string; ring: string }[] = [
  { value: 'clase',    label: 'Clase',    dot: 'bg-brand-500',  ring: 'ring-brand-400'  },
  { value: 'parcial',  label: 'Parcial',  dot: 'bg-red-500',    ring: 'ring-red-400'    },
  { value: 'tarea',    label: 'Tarea',    dot: 'bg-green-500',  ring: 'ring-green-400'  },
  { value: 'personal', label: 'Personal', dot: 'bg-orange-500', ring: 'ring-orange-400' },
  { value: 'sprint',   label: 'Sprint',   dot: 'bg-yellow-500', ring: 'ring-yellow-400' },
]

interface Props {
  selectedDate: string  // 'YYYY-MM-DD'
  onClose:  () => void
  onCreado: () => void
}

export default function EventoModal({ selectedDate, onClose, onCreado }: Props) {
  const [isPending, startTransition] = useTransition()
  const [titulo,      setTitulo]      = useState('')
  const [tipo,        setTipo]        = useState<TipoEvento>('clase')
  const [fecha,       setFecha]       = useState(selectedDate)
  const [horaInicio,  setHoraInicio]  = useState('')
  const [horaFin,     setHoraFin]     = useState('')
  const [todoDia,     setTodoDia]     = useState(false)
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null)

  const inputCls = 'w-full rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20'
  const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-brand-400'

  function handleGuardar() {
    if (!titulo.trim()) { setErrorMsg('El nombre del evento es obligatorio.'); return }
    if (!fecha)          { setErrorMsg('La fecha es obligatoria.');             return }
    setErrorMsg(null)

    startTransition(async () => {
      const result = await crearEvento({
        titulo,
        tipo,
        fecha,
        hora_inicio: todoDia ? null : (horaInicio || null),
        hora_fin:    todoDia ? null : (horaFin || null),
        todo_el_dia: todoDia,
      })
      if (!result.ok) {
        setErrorMsg(result.error ?? 'Error al crear el evento.')
        return
      }
      onCreado()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !isPending) onClose() }}
    >
      <div className="w-[440px] rounded-2xl bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <h2 className="mb-6 font-fraunces text-xl font-semibold text-brand-900">
          Crear evento
        </h2>

        {/* Nombre */}
        <div className="mb-4">
          <label className={labelCls} htmlFor="ev-titulo">Nombre del evento</label>
          <input
            id="ev-titulo"
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ej: Parcial de Estadística"
            className={inputCls}
            autoFocus
          />
        </div>

        {/* Tipo */}
        <div className="mb-4">
          <p className={labelCls}>Tipo</p>
          <div className="flex flex-wrap gap-2">
            {TIPOS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTipo(t.value)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition',
                  tipo === t.value
                    ? `border-transparent bg-brand-50 ring-2 ${t.ring}`
                    : 'border-brand-100 bg-white text-brand-500 hover:border-brand-200'
                )}
              >
                <span className={cn('h-2.5 w-2.5 rounded-full', t.dot)} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <div className="mb-4">
          <label className={labelCls} htmlFor="ev-fecha">Fecha</label>
          <input
            id="ev-fecha"
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Todo el día toggle */}
        <div className="mb-4 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setTodoDia(v => !v)}
            className={cn(
              'relative h-5 w-9 rounded-full transition',
              todoDia ? 'bg-brand-500' : 'bg-brand-200'
            )}
          >
            <span className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
              todoDia ? 'left-4' : 'left-0.5'
            )} />
          </button>
          <span className="text-[13px] font-medium text-brand-600">Todo el día</span>
        </div>

        {/* Hora inicio / fin */}
        {!todoDia && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="ev-hora-inicio">Hora inicio</label>
              <input
                id="ev-hora-inicio"
                type="time"
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="ev-hora-fin">Hora fin</label>
              <input
                id="ev-hora-fin"
                type="time"
                value={horaFin}
                onChange={e => setHoraFin(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={isPending}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition hover:bg-brand-600 disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : 'Crear evento'}
          </button>
        </div>
      </div>
    </div>
  )
}
