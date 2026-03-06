'use client'

import { useState, useTransition } from 'react'
import { toggleTodo, crearTodo } from '@/app/(app)/calendario/actions'
import type { StatsFoco } from '@/app/(app)/temporizador/actions'
import type { MateriasStats } from '@/app/(app)/page'
import type { Todo, Evento, TipoEvento } from '@/lib/supabase/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatFecha(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatHora(hora: string | null): string {
  if (!hora) return ''
  return hora.slice(0, 5) // "HH:MM"
}

// ─── Colores por tipo de evento ───────────────────────────────────────────────

const TIPO_COLOR: Record<TipoEvento, string> = {
  clase:    'bg-blue-400',
  parcial:  'bg-red-400',
  tarea:    'bg-amber-400',
  personal: 'bg-green-400',
  sprint:   'bg-orange-400',
}

const TIPO_LABEL: Record<TipoEvento, string> = {
  clase:    'Clase',
  parcial:  'Parcial',
  tarea:    'Tarea',
  personal: 'Personal',
  sprint:   'Sprint',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  nombre: string
  todosIniciales: Todo[]
  eventosProximos: Evento[]
  stats: StatsFoco
  materiasStats: MateriasStats
  fechaHoy: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function HomeClient({
  nombre,
  todosIniciales,
  eventosProximos,
  stats,
  materiasStats,
  fechaHoy,
}: Props) {
  const [todos, setTodos] = useState<Todo[]>(todosIniciales)
  const [inputTodo, setInputTodo] = useState('')
  const [isPending, startTransition] = useTransition()

  const { promedio, aprobadas, total, cursando } = materiasStats

  // ── Toggle todo ──────────────────────────────────────────────────────────────
  function handleToggle(id: string, completado: boolean) {
    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completado: !completado } : t))
    )
    startTransition(async () => {
      const res = await toggleTodo(id, !completado)
      if (!res.ok) {
        // Revertir si falla
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completado } : t))
        )
      }
    })
  }

  // ── Crear todo ───────────────────────────────────────────────────────────────
  function handleCrearTodo(e: React.FormEvent) {
    e.preventDefault()
    const texto = inputTodo.trim()
    if (!texto) return
    setInputTodo('')

    // Optimistic insert con id temporal
    const tempId = `temp-${Date.now()}`
    const nuevoTodo: Todo = {
      id: tempId,
      usuario_id: '',
      texto,
      completado: false,
      categoria: '',
      fecha: fechaHoy,
      orden: todos.length,
      creado_en: new Date().toISOString(),
    }
    setTodos((prev) => [...prev, nuevoTodo])

    startTransition(async () => {
      const res = await crearTodo(texto, fechaHoy)
      if (res.ok && res.id) {
        setTodos((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, id: res.id! } : t))
        )
      } else {
        // Revertir
        setTodos((prev) => prev.filter((t) => t.id !== tempId))
      }
    })
  }

  const todosCompletados = todos.filter((t) => t.completado).length

  return (
    <div className="min-h-screen bg-brand-50 px-6 py-8 md:px-10">
    <div className="mx-auto flex max-w-5xl flex-col gap-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-fraunces text-2xl font-bold text-brand-900">
            {getGreeting()}, <span className="text-brand-600">{nombre}</span>
          </h1>
          <p className="mt-0.5 text-sm text-brand-400 capitalize">{formatFecha(fechaHoy)}</p>
        </div>
        {/* Chip de racha */}
        {stats.racha > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
            <span>🔥</span>
            <span className="text-sm font-semibold text-orange-700">
              {stats.racha} día{stats.racha !== 1 ? 's' : ''} de racha
            </span>
          </div>
        )}
      </div>

      {/* ── Stats grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        {/* Racha de foco */}
        <div className="flex flex-col gap-1 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-2xl">🔥</span>
          <p className="font-fraunces text-3xl font-bold text-orange-800">{stats.racha}</p>
          <p className="text-xs font-semibold text-orange-500">Días de foco</p>
        </div>

        {/* Carrera */}
        <div className="flex flex-col gap-1 rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-2xl">🎓</span>
          <p className="font-fraunces text-3xl font-bold text-brand-900">
            {aprobadas}
            <span className="text-base font-medium text-brand-400">/{total}</span>
          </p>
          <p className="text-xs font-semibold text-brand-400">Aprobadas</p>
          {total > 0 && (
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-brand-400 transition-all"
                style={{ width: `${(aprobadas / total) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Promedio */}
        <div className="flex flex-col gap-1 rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-2xl">📊</span>
          <p className="font-fraunces text-3xl font-bold text-brand-900">
            {promedio !== null ? promedio.toFixed(2) : '—'}
          </p>
          <p className="text-xs font-semibold text-brand-400">Promedio general</p>
        </div>

        {/* Cursando */}
        <div className="flex flex-col gap-1 rounded-2xl border border-teal-100 bg-teal-50 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-2xl">📚</span>
          <p className="font-fraunces text-3xl font-bold text-teal-800">{cursando}</p>
          <p className="text-xs font-semibold text-teal-500">En curso</p>
        </div>
      </div>

      {/* ── Bottom row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* ── To-do de hoy ──────────────────────────────────────────────────── */}
        <div className="flex flex-col rounded-2xl border border-brand-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
            <div>
              <p className="font-fraunces text-base font-semibold text-brand-900">To-do de hoy</p>
              {todos.length > 0 && (
                <p className="text-xs text-brand-400">
                  {todosCompletados}/{todos.length} completadas
                </p>
              )}
            </div>
            <span className="text-xl">✅</span>
          </div>

          {/* Lista */}
          <div className="flex flex-col divide-y divide-brand-50">
            {todos.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-brand-300">
                Sin tareas para hoy
              </p>
            ) : (
              todos.map((todo) => (
                <label
                  key={todo.id}
                  className="flex cursor-pointer items-center gap-3 px-5 py-3 transition hover:bg-brand-50"
                >
                  <input
                    type="checkbox"
                    checked={todo.completado}
                    onChange={() => handleToggle(todo.id, todo.completado)}
                    className="h-4 w-4 rounded border-brand-300 text-brand-500 accent-brand-500"
                  />
                  <span
                    className={`text-sm transition ${
                      todo.completado
                        ? 'text-brand-300 line-through'
                        : 'text-brand-800'
                    }`}
                  >
                    {todo.texto}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* Input nueva tarea */}
          <form onSubmit={handleCrearTodo} className="flex gap-2 border-t border-brand-100 px-5 py-3">
            <input
              type="text"
              value={inputTodo}
              onChange={(e) => setInputTodo(e.target.value)}
              placeholder="Agregar tarea..."
              className="flex-1 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none placeholder:text-brand-300 focus:border-brand-400 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isPending || !inputTodo.trim()}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-40"
            >
              +
            </button>
          </form>
        </div>

        {/* ── Próximos eventos ──────────────────────────────────────────────── */}
        <div className="flex flex-col rounded-2xl border border-brand-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
            <p className="font-fraunces text-base font-semibold text-brand-900">Próximos eventos</p>
            <span className="text-xl">📅</span>
          </div>

          <div className="flex flex-col divide-y divide-brand-50">
            {eventosProximos.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-brand-300">
                Sin eventos próximos
              </p>
            ) : (
              eventosProximos.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 px-5 py-3">
                  {/* Dot de color */}
                  <div
                    className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${TIPO_COLOR[ev.tipo]}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-800">{ev.titulo}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-brand-400">
                      <span className="capitalize">{formatFecha(ev.fecha)}</span>
                      {ev.hora_inicio && (
                        <>
                          <span>·</span>
                          <span>{formatHora(ev.hora_inicio)}</span>
                        </>
                      )}
                    </div>
                    {ev.locacion && (
                      <p className="mt-0.5 truncate text-xs text-brand-300">{ev.locacion}</p>
                    )}
                  </div>
                  <span className="flex-shrink-0 rounded-lg bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-400">
                    {TIPO_LABEL[ev.tipo]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Foco de esta semana ─────────────────────────────────────────────── */}
      {(stats.hoy > 0 || stats.semana > 0) && (
        <div className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white px-6 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Foco hoy</p>
              <p className="font-fraunces text-lg font-bold text-brand-900">{stats.hoy} min</p>
            </div>
          </div>
          <div className="h-8 w-px bg-brand-100" />
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Esta semana</p>
              <p className="font-fraunces text-lg font-bold text-brand-900">
                {Math.floor(stats.semana / 60) > 0
                  ? `${Math.floor(stats.semana / 60)}h ${stats.semana % 60}m`
                  : `${stats.semana}m`}
              </p>
            </div>
          </div>
          {stats.topMaterias.length > 0 && (
            <>
              <div className="h-8 w-px bg-brand-100" />
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Top materia</p>
                  <p className="font-fraunces text-lg font-bold text-brand-900 max-w-[140px] truncate">
                    {stats.topMaterias[0].nombre}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
    </div>
  )
}
