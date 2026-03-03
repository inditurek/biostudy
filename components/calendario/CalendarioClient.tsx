'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import type { EventoRow, TodoRow } from '@/app/(app)/calendario/actions'
import {
  cargarEventosMes,
  cargarTodosFecha,
  crearTodo,
  toggleTodo,
  eliminarTodo,
  eliminarEvento,
} from '@/app/(app)/calendario/actions'
import EventoModal from './EventoModal'

// ── Configuración de tipos de evento ─────────────────────────────────────────

type TipoEvento = 'clase' | 'parcial' | 'tarea' | 'personal' | 'sprint'

const TIPO_CONFIG: Record<TipoEvento, {
  label: string
  dot: string
  chip: string
  chipText: string
}> = {
  clase:    { label: 'Clase',    dot: 'bg-brand-500',  chip: 'bg-brand-50  border-brand-200',  chipText: 'text-brand-700'  },
  parcial:  { label: 'Parcial',  dot: 'bg-red-500',    chip: 'bg-red-50    border-red-200',    chipText: 'text-red-700'    },
  tarea:    { label: 'Tarea',    dot: 'bg-green-500',  chip: 'bg-green-50  border-green-200',  chipText: 'text-green-700'  },
  personal: { label: 'Personal', dot: 'bg-orange-500', chip: 'bg-orange-50 border-orange-200', chipText: 'text-orange-700' },
  sprint:   { label: 'Sprint',   dot: 'bg-yellow-500', chip: 'bg-yellow-50 border-yellow-200', chipText: 'text-yellow-700' },
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEMANA = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

// ── Helpers de fecha ──────────────────────────────────────────────────────────

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseDateStr(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split('-').map(Number)
  return { y, m: m - 1, d }
}

function formatDiaCompleto(dateStr: string): string {
  const { y, m, d } = parseDateStr(dateStr)
  const fecha = new Date(y, m, d)
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  return `${dias[fecha.getDay()]} ${d} de ${MESES[m]}`
}

function formatHora(h: string | null): string {
  if (!h) return ''
  return h.slice(0, 5)
}

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
  initialYear:         number
  initialMonth:        number
  initialEventos:      EventoRow[]
  initialTodos:        TodoRow[]
  initialSelectedDate: string
}

export default function CalendarioClient({
  initialYear,
  initialMonth,
  initialEventos,
  initialTodos,
  initialSelectedDate,
}: Props) {
  const todayStr = new Date().toISOString().slice(0, 10)

  const [year,         setYear]         = useState(initialYear)
  const [month,        setMonth]        = useState(initialMonth)
  const [eventos,      setEventos]      = useState<EventoRow[]>(initialEventos)
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate)
  const [todos,        setTodos]        = useState<TodoRow[]>(initialTodos)
  const [showModal,    setShowModal]    = useState(false)
  const [newTodo,      setNewTodo]      = useState('')
  const [isPending,    startTransition] = useTransition()

  // ── Navegación de mes ────────────────────────────────────────────────────────

  function changeMonth(dir: number) {
    let nm = month + dir
    let ny = year
    if (nm > 11) { nm = 0; ny++ }
    if (nm < 0)  { nm = 11; ny-- }
    setYear(ny)
    setMonth(nm)
    startTransition(async () => {
      const result = await cargarEventosMes(ny, nm)
      setEventos(result)
    })
  }

  // ── Seleccionar día ──────────────────────────────────────────────────────────

  function selectDay(dateStr: string) {
    setSelectedDate(dateStr)
    startTransition(async () => {
      const result = await cargarTodosFecha(dateStr)
      setTodos(result)
    })
  }

  // ── Todos ────────────────────────────────────────────────────────────────────

  function handleAddTodo(e: React.FormEvent) {
    e.preventDefault()
    const texto = newTodo.trim()
    if (!texto) return
    setNewTodo('')
    startTransition(async () => {
      const result = await crearTodo(texto, selectedDate)
      if (result.ok) {
        const refreshed = await cargarTodosFecha(selectedDate)
        setTodos(refreshed)
      }
    })
  }

  function handleToggleTodo(id: string, completado: boolean) {
    // Optimistic update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completado } : t))
    startTransition(async () => {
      await toggleTodo(id, completado)
    })
  }

  function handleDeleteTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
    startTransition(async () => {
      await eliminarTodo(id)
    })
  }

  // ── Después de crear un evento ───────────────────────────────────────────────

  function handleEventoCreado() {
    setShowModal(false)
    startTransition(async () => {
      const refreshed = await cargarEventosMes(year, month)
      setEventos(refreshed)
    })
  }

  function handleDeleteEvento(id: string) {
    setEventos(prev => prev.filter(e => e.id !== id))
    startTransition(async () => {
      await eliminarEvento(id)
    })
  }

  // ── Generar celdas del mes ────────────────────────────────────────────────────

  const primerDia     = new Date(year, month, 1)
  let   primerDow     = primerDia.getDay()          // 0=Dom
  primerDow           = primerDow === 0 ? 6 : primerDow - 1  // 0=Lun
  const diasEnMes     = new Date(year, month + 1, 0).getDate()
  const diasEnPrevMes = new Date(year, month, 0).getDate()

  type Cell = { day: number; dateStr: string; curMonth: boolean }
  const cells: Cell[] = []

  for (let i = primerDow - 1; i >= 0; i--) {
    const d = diasEnPrevMes - i
    const pm = month === 0 ? 11 : month - 1
    const py = month === 0 ? year - 1 : year
    cells.push({ day: d, dateStr: toDateStr(py, pm, d), curMonth: false })
  }
  for (let d = 1; d <= diasEnMes; d++) {
    cells.push({ day: d, dateStr: toDateStr(year, month, d), curMonth: true })
  }
  while (cells.length % 7 !== 0) {
    const d   = cells.length - diasEnMes - primerDow + 1
    const nm  = month === 11 ? 0 : month + 1
    const ny  = month === 11 ? year + 1 : year
    cells.push({ day: d, dateStr: toDateStr(ny, nm, d), curMonth: false })
  }

  // Mapa de eventos por fecha para acceso rápido
  const eventosPorFecha: Record<string, EventoRow[]> = {}
  for (const ev of eventos) {
    if (!eventosPorFecha[ev.fecha]) eventosPorFecha[ev.fecha] = []
    eventosPorFecha[ev.fecha].push(ev)
  }

  // Eventos del día seleccionado
  const eventosDelDia = (eventosPorFecha[selectedDate] ?? [])
    .slice()
    .sort((a, b) => {
      if (a.todo_el_dia && !b.todo_el_dia) return 1
      if (!a.todo_el_dia && b.todo_el_dia) return -1
      return (a.hora_inicio ?? '').localeCompare(b.hora_inicio ?? '')
    })

  const todosDone  = todos.filter(t => t.completado).length
  const todosTotal = todos.length

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-brand-50 px-6 py-8 md:px-10">

      {/* ── Header ── */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-fraunces text-[28px] font-bold text-brand-900">
          Calendario 📅
        </h1>

        <div className="flex items-center gap-3">
          {/* Navegación de mes */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-100 bg-white text-brand-400 transition hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="min-w-[148px] text-center font-fraunces text-[17px] font-semibold text-brand-900">
              {MESES[month]} {year}
            </span>
            <button
              onClick={() => changeMonth(1)}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-100 bg-white text-brand-400 transition hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Botón crear */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition hover:-translate-y-px hover:bg-brand-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M12 4v16m8-8H4" />
            </svg>
            Crear evento
          </button>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">

        {/* ── Grilla del mes ── */}
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {/* Cabecera días de semana */}
          <div className="grid grid-cols-7 border-b border-brand-50">
            {DIAS_SEMANA.map((d, i) => (
              <div
                key={d}
                className={cn(
                  'py-3 text-center text-[11px] font-bold uppercase tracking-wider',
                  i >= 5 ? 'text-red-400' : 'text-brand-300'
                )}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Celdas */}
          <div className="grid grid-cols-7">
            {cells.map(({ day, dateStr, curMonth }) => {
              const isToday    = dateStr === todayStr
              const isSelected = dateStr === selectedDate
              const evs        = eventosPorFecha[dateStr] ?? []
              const isWeekend  = (() => {
                const dow = new Date(dateStr).getDay()
                return dow === 0 || dow === 6
              })()

              return (
                <div
                  key={dateStr}
                  onClick={() => selectDay(dateStr)}
                  className={cn(
                    'min-h-[88px] cursor-pointer border-b border-r border-brand-50 p-2 transition',
                    'last-of-type:border-r-0',
                    !curMonth && 'opacity-30',
                    isToday && !isSelected && 'bg-brand-50/60',
                    isSelected && 'bg-brand-100/50',
                    curMonth && !isSelected && 'hover:bg-brand-50'
                  )}
                >
                  <div className={cn(
                    'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold',
                    isToday
                      ? 'bg-brand-500 text-white'
                      : isSelected
                        ? 'bg-brand-200 text-brand-800'
                        : isWeekend
                          ? 'text-red-400'
                          : 'text-brand-900'
                  )}>
                    {day}
                  </div>

                  {/* Eventos (máx 2 + "+N más") */}
                  <div className="flex flex-col gap-0.5">
                    {evs.slice(0, 2).map(ev => {
                      const cfg = TIPO_CONFIG[ev.tipo as TipoEvento]
                      return (
                        <div
                          key={ev.id}
                          className="truncate rounded-[4px] px-1.5 py-px text-[10px] font-semibold"
                          style={{}}
                        >
                          <span className={cn('inline-flex items-center gap-1 rounded px-1 py-px text-[10px]', cfg.chip, cfg.chipText)}>
                            <span className={cn('h-1.5 w-1.5 flex-shrink-0 rounded-full', cfg.dot)} />
                            <span className="truncate">{ev.titulo}</span>
                          </span>
                        </div>
                      )
                    })}
                    {evs.length > 2 && (
                      <p className="px-1 text-[10px] text-brand-400">+{evs.length - 2} más</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Panel derecho ── */}
        <div className="flex flex-col gap-4">

          {/* Detalle del día */}
          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
            <h2 className="mb-4 font-fraunces text-[15px] font-semibold text-brand-900">
              {formatDiaCompleto(selectedDate)}
              {selectedDate === todayStr && (
                <span className="ml-2 text-[11px] font-medium text-brand-400">· Hoy</span>
              )}
            </h2>

            {eventosDelDia.length === 0 ? (
              <p className="text-[13px] text-brand-300">Sin eventos. ¡Creá uno con el botón de arriba!</p>
            ) : (
              <div className="flex flex-col divide-y divide-brand-50">
                {eventosDelDia.map(ev => {
                  const cfg = TIPO_CONFIG[ev.tipo as TipoEvento]
                  return (
                    <div key={ev.id} className="group flex items-start gap-3 py-3">
                      <span className={cn('mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full', cfg.dot)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-brand-900">{ev.titulo}</p>
                        <p className="mt-0.5 text-[11px] text-brand-400">
                          {ev.todo_el_dia
                            ? 'Todo el día'
                            : `${formatHora(ev.hora_inicio)}${ev.hora_fin ? ` – ${formatHora(ev.hora_fin)}` : ''}`
                          }
                        </p>
                        <span className={cn(
                          'mt-1 inline-block rounded-full border px-2 py-px text-[10px] font-semibold',
                          cfg.chip, cfg.chipText
                        )}>
                          {cfg.label}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteEvento(ev.id)}
                        className="mt-1 flex-shrink-0 rounded p-1 text-brand-200 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        title="Eliminar evento"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* To-do list */}
          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-fraunces text-[15px] font-semibold text-brand-900">
                To-do
              </h2>
              {todosTotal > 0 && (
                <span className="text-[11px] text-brand-400">
                  {todosDone}/{todosTotal} completadas
                </span>
              )}
            </div>

            {/* Lista */}
            <div className="flex flex-col gap-1">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-brand-50"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleTodo(todo.id, !todo.completado)}
                    className={cn(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition',
                      todo.completado
                        ? 'border-brand-500 bg-brand-500'
                        : 'border-brand-200 hover:border-brand-400'
                    )}
                  >
                    {todo.completado && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Texto */}
                  <p className={cn(
                    'flex-1 text-[13px] font-medium leading-snug',
                    todo.completado ? 'text-brand-300 line-through' : 'text-brand-900'
                  )}>
                    {todo.texto}
                  </p>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="flex-shrink-0 rounded p-1 text-brand-200 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Input agregar */}
            <form onSubmit={handleAddTodo} className="mt-3">
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-brand-200 px-3 py-2 transition focus-within:border-brand-400 focus-within:bg-brand-50">
                <svg className="h-3.5 w-3.5 flex-shrink-0 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" d="M12 4v16m8-8H4" />
                </svg>
                <input
                  type="text"
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  placeholder="Agregar tarea..."
                  className="flex-1 bg-transparent text-[13px] text-brand-900 outline-none placeholder:text-brand-300"
                />
                {newTodo.trim() && (
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-brand-500 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    +
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* ── Modal crear evento ── */}
      {showModal && (
        <EventoModal
          selectedDate={selectedDate}
          onClose={() => setShowModal(false)}
          onCreado={handleEventoCreado}
        />
      )}
    </div>
  )
}
