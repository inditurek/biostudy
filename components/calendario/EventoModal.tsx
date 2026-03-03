'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import type { EventoRow } from '@/app/(app)/calendario/actions'
import type { RecurrenciaEvento } from '@/lib/supabase/types'
import { crearEvento, editarEvento, eliminarEvento } from '@/app/(app)/calendario/actions'

// ── Constantes ────────────────────────────────────────────────────────────────

type TipoEvento = 'clase' | 'parcial' | 'tarea' | 'personal' | 'sprint'

const TIPOS: { value: TipoEvento; label: string; dot: string; ring: string }[] = [
  { value: 'clase',    label: 'Clase',    dot: 'bg-brand-500',  ring: 'ring-brand-400'  },
  { value: 'parcial',  label: 'Parcial',  dot: 'bg-red-500',    ring: 'ring-red-400'    },
  { value: 'tarea',    label: 'Tarea',    dot: 'bg-green-500',  ring: 'ring-green-400'  },
  { value: 'personal', label: 'Personal', dot: 'bg-orange-500', ring: 'ring-orange-400' },
  { value: 'sprint',   label: 'Sprint',   dot: 'bg-yellow-500', ring: 'ring-yellow-400' },
]

const RECURRENCIAS: { value: RecurrenciaEvento; label: string }[] = [
  { value: 'ninguna',   label: 'No se repite'       },
  { value: 'semanal',   label: 'Cada semana'        },
  { value: 'quincenal', label: 'Cada dos semanas'   },
  { value: 'mensual',   label: 'Cada mes'           },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  selectedDate: string       // fecha por defecto al crear
  evento?:      EventoRow    // si se pasa → modo edición
  onClose:      () => void
  onGuardado:   () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function EventoModal({ selectedDate, evento, onClose, onGuardado }: Props) {
  const isEdit = !!evento
  const [isPending, startTransition] = useTransition()

  // Campos (pre-rellenos en modo edición)
  const [titulo,         setTitulo]         = useState(evento?.titulo                    ?? '')
  const [tipo,           setTipo]           = useState<TipoEvento>((evento?.tipo         ?? 'clase') as TipoEvento)
  const [fecha,          setFecha]          = useState(evento?.fecha                     ?? selectedDate)
  const [horaInicio,     setHoraInicio]     = useState((evento?.hora_inicio              ?? '').slice(0, 5))
  const [horaFin,        setHoraFin]        = useState((evento?.hora_fin                 ?? '').slice(0, 5))
  const [todoDia,        setTodoDia]        = useState(evento?.todo_el_dia               ?? false)
  const [locacion,       setLocacion]       = useState(evento?.locacion                  ?? '')
  const [descripcion,    setDescripcion]    = useState(evento?.descripcion               ?? '')
  const [recurrencia,    setRecurrencia]    = useState<RecurrenciaEvento>(evento?.recurrencia     ?? 'ninguna')
  const [recurrenciaFin, setRecurrenciaFin] = useState(evento?.recurrencia_fin           ?? '')
  const [errorMsg,       setErrorMsg]       = useState<string | null>(null)

  const inputCls = 'w-full rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20'
  const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-brand-400'

  // ── Guardar ────────────────────────────────────────────────────────────────

  function handleGuardar() {
    if (!titulo.trim()) { setErrorMsg('El nombre del evento es obligatorio.'); return }
    if (!fecha)          { setErrorMsg('La fecha es obligatoria.');             return }
    setErrorMsg(null)

    const input = {
      titulo,
      tipo,
      fecha,
      hora_inicio:     todoDia ? null : (horaInicio || null),
      hora_fin:        todoDia ? null : (horaFin    || null),
      todo_el_dia:     todoDia,
      locacion:        locacion.trim()    || null,
      descripcion:     descripcion.trim() || null,
      recurrencia,
      recurrencia_fin: recurrencia === 'ninguna' ? null : (recurrenciaFin || null),
    }

    startTransition(async () => {
      const result = isEdit && evento
        ? await editarEvento(evento.id, input)
        : await crearEvento(input)

      if (!result.ok) {
        setErrorMsg(result.error ?? 'Error al guardar el evento.')
        return
      }
      onGuardado()
    })
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────

  function handleEliminar() {
    if (!evento) return
    startTransition(async () => {
      await eliminarEvento(evento.id)
      onGuardado()
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !isPending) onClose() }}
    >
      <div className="w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">

        {/* Título del modal */}
        <h2 className="mb-6 font-fraunces text-xl font-semibold text-brand-900">
          {isEdit ? 'Editar evento' : 'Crear evento'}
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
            autoFocus={!isEdit}
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
              'relative h-5 w-9 flex-shrink-0 rounded-full transition',
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

        {/* Locación */}
        <div className="mb-4">
          <label className={labelCls} htmlFor="ev-locacion">Locación <span className="normal-case font-normal">(opcional)</span></label>
          <input
            id="ev-locacion"
            type="text"
            value={locacion}
            onChange={e => setLocacion(e.target.value)}
            placeholder="Ej: Aula 201 — Facultad de Cs. Exactas"
            className={inputCls}
          />
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className={labelCls} htmlFor="ev-descripcion">Descripción <span className="normal-case font-normal">(opcional)</span></label>
          <textarea
            id="ev-descripcion"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Notas adicionales sobre el evento..."
            rows={3}
            className={cn(inputCls, 'resize-none')}
          />
        </div>

        {/* Recurrencia */}
        <div className="mb-4">
          <label className={labelCls} htmlFor="ev-recurrencia">Repetición</label>
          <select
            id="ev-recurrencia"
            value={recurrencia}
            onChange={e => setRecurrencia(e.target.value as RecurrenciaEvento)}
            className={inputCls}
          >
            {RECURRENCIAS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Repetir hasta (solo si hay recurrencia) */}
        {recurrencia !== 'ninguna' && (
          <div className="mb-4">
            <label className={labelCls} htmlFor="ev-recurrencia-fin">
              Repetir hasta <span className="normal-case font-normal">(opcional)</span>
            </label>
            <input
              id="ev-recurrencia-fin"
              type="date"
              value={recurrenciaFin}
              onChange={e => setRecurrenciaFin(e.target.value)}
              className={inputCls}
            />
            <p className="mt-1 text-[11px] text-brand-300">
              Si no lo especificás, el evento se repite indefinidamente.
            </p>
          </div>
        )}

        {/* Aviso series recurrentes en modo edición */}
        {isEdit && evento && evento.recurrencia !== 'ninguna' && (
          <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-[12px] text-brand-500">
            🔄 Este es un evento recurrente. Los cambios afectan a toda la serie.
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Eliminar — solo en modo edición */}
          {isEdit ? (
            <button
              type="button"
              onClick={handleEliminar}
              disabled={isPending}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
            >
              Eliminar
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2.5">
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
              {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
