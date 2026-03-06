'use client'

import { useState, useTransition, useMemo } from 'react'
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

function formatFechaLong(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const s = d.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatFechaCorta(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatHora(hora: string | null): string {
  if (!hora) return ''
  return hora.slice(0, 5)
}

function diasHasta(iso: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fecha = new Date(iso + 'T00:00:00')
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000)
}

function labelDia(iso: string): string {
  const d = diasHasta(iso)
  if (d === 0) return 'Hoy'
  if (d === 1) return 'Mañana'
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short' })
}

// ─── Colores por tipo de evento ───────────────────────────────────────────────

const TIPO_DOT: Record<TipoEvento, string> = {
  clase:    'bg-brand-400',
  parcial:  'bg-red-500',
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

// ─── Tipo notificación ────────────────────────────────────────────────────────

interface Notif {
  id: string
  tipo: 'urgent' | 'info' | 'success'
  icon: string
  titulo: string
  sub: string
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
  const [dismissed, setDismissed] = useState<string[]>([])

  const { promedio, aprobadas, total, cursando } = materiasStats
  const carreraPercent = total > 0 ? Math.round((aprobadas / total) * 100) : 0
  const todosCompletados = todos.filter((t) => t.completado).length

  // ── Notificaciones derivadas ──────────────────────────────────────────────
  const notifs = useMemo<Notif[]>(() => {
    const list: Notif[] = []

    // Parciales próximos (≤ 7 días) — van primero (urgent)
    eventosProximos
      .filter((ev) => ev.tipo === 'parcial')
      .forEach((ev) => {
        const d = diasHasta(ev.fecha)
        if (d >= 0 && d <= 7) {
          const cuando = d === 0 ? 'hoy' : d === 1 ? 'mañana' : `en ${d} días`
          list.push({
            id: `parcial-${ev.id}`,
            tipo: 'urgent',
            icon: '⚠️',
            titulo: `${ev.titulo} — ${cuando}. ¿Ya activaste el modo Sprint?`,
            sub: [formatFechaCorta(ev.fecha), ev.locacion].filter(Boolean).join(' · '),
          })
        }
      })

    // Racha de estudio
    if (stats.racha > 0) {
      list.push({
        id: 'racha',
        tipo: 'success',
        icon: '🔥',
        titulo: `¡Racha de ${stats.racha} día${stats.racha !== 1 ? 's' : ''} estudiando! Seguís en racha.`,
        sub: 'Completá al menos una sesión de foco hoy para mantenerla.',
      })
    }

    return list
  }, [stats.racha, eventosProximos])

  const notifsVisibles = notifs.filter((n) => !dismissed.includes(n.id))

  // ── Toggle todo ───────────────────────────────────────────────────────────
  function handleToggle(id: string, completado: boolean) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completado: !completado } : t)))
    startTransition(async () => {
      const res = await toggleTodo(id, !completado)
      if (!res.ok) {
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completado } : t)))
      }
    })
  }

  // ── Crear todo ────────────────────────────────────────────────────────────
  function handleCrearTodo(e: React.FormEvent) {
    e.preventDefault()
    const texto = inputTodo.trim()
    if (!texto) return
    setInputTodo('')
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
        setTodos((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: res.id! } : t)))
      } else {
        setTodos((prev) => prev.filter((t) => t.id !== tempId))
      }
    })
  }

  return (
    <div
      className="min-h-screen px-6 py-8 md:px-10"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 20% -10%, rgba(124,58,237,.1) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(168,85,247,.07) 0%, transparent 55%), #faf7ff',
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-400">
              Bienvenido de vuelta
            </p>
            <h1 className="mt-1 font-fraunces text-[36px] font-semibold leading-tight text-brand-900">
              {getGreeting()}, <span className="text-brand-600">{nombre}</span>
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">Hoy es un buen día para avanzar.</p>
          </div>
          <div className="flex items-center gap-3 sm:mt-2">
            {/* Chip de fecha */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-brand-700 shadow-sm">
              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {formatFechaLong(fechaHoy)}
            </div>
            {/* Avatar */}
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-300 font-fraunces text-base font-semibold text-white shadow-[0_4px_12px_rgba(124,58,237,.3)]">
              {nombre.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── Notificaciones inteligentes ──────────────────────────────────── */}
        {notifsVisibles.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {notifsVisibles.map((n) => (
              <div
                key={n.id}
                className={`flex cursor-default items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition hover:-translate-y-px hover:shadow-md ${
                  n.tipo === 'urgent'
                    ? 'border-orange-200 bg-orange-50'
                    : n.tipo === 'success'
                    ? 'border-green-200 bg-green-50'
                    : 'border-brand-200 bg-brand-50'
                }`}
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-lg ${
                    n.tipo === 'urgent'
                      ? 'bg-orange-100'
                      : n.tipo === 'success'
                      ? 'bg-green-100'
                      : 'bg-brand-100'
                  }`}
                >
                  {n.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-brand-900">{n.titulo}</p>
                  {n.sub && <p className="mt-0.5 text-xs text-gray-500">{n.sub}</p>}
                </div>
                <button
                  onClick={() => setDismissed((prev) => [...prev, n.id])}
                  className="flex-shrink-0 text-xl leading-none text-gray-300 transition hover:text-brand-400"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Dashboard — 4 cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">

          {/* 🔥 Racha */}
          <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(91,45,158,.1)]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">🔥 Racha actual</p>
            <p className="font-fraunces text-[32px] font-bold leading-none text-orange-600">{stats.racha}</p>
            <p className="text-xs text-gray-400">días seguidos estudiando</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((stats.racha / 30) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #ea580c, #fb923c)',
                }}
              />
            </div>
          </div>

          {/* 🎓 Carrera */}
          <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(91,45,158,.1)]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">🎓 Carrera completada</p>
            <p className="font-fraunces text-[32px] font-bold leading-none text-brand-500">{carreraPercent}%</p>
            <p className="text-xs text-gray-400">{aprobadas} de {total} materias aprobadas</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${carreraPercent}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #c084fc)',
                }}
              />
            </div>
          </div>

          {/* 📊 Promedio */}
          <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(91,45,158,.1)]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">📊 Promedio general</p>
            <p className="font-fraunces text-[32px] font-bold leading-none text-green-600">
              {promedio !== null ? promedio.toFixed(2) : '—'}
            </p>
            <p className="text-xs text-gray-400">calificación acumulada</p>
            {promedio !== null && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(promedio / 10) * 100}%`,
                    background: 'linear-gradient(90deg, #16a34a, #4ade80)',
                  }}
                />
              </div>
            )}
          </div>

          {/* ✅ Cuatrimestre */}
          <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(91,45,158,.1)]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">✅ Este cuatrimestre</p>
            <p className="font-fraunces text-[32px] font-bold leading-none text-blue-600">{cursando}</p>
            <p className="text-xs text-gray-400">materias en curso</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${total > 0 ? Math.min((cursando / total) * 100, 100) : 0}%`,
                  background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Progress banner ───────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-2xl p-7 shadow-[0_8px_32px_rgba(91,45,158,.3)]"
          style={{ background: 'linear-gradient(135deg, #3d1a6e 0%, #7c3aed 60%, #a855f7 100%)' }}
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute bottom-[-80px] right-16 h-40 w-40 rounded-full bg-white/[0.04]" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-white">Cuatrimestre en curso 🎯</h2>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-white/70">
                Tu progreso académico en este cuatrimestre.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="font-fraunces text-3xl font-bold text-white">{cursando}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/60">Cursando</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-center">
                <p className="font-fraunces text-3xl font-bold text-white">{aprobadas}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/60">Aprobadas</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-center">
                <p className="font-fraunces text-3xl font-bold text-white">
                  {promedio !== null ? promedio.toFixed(1) : '—'}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/60">Promedio gral.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* To-do de hoy */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <p className="font-fraunces text-[15px] font-semibold text-brand-900">To-do de hoy</p>
                {todos.length > 0 && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {todosCompletados}/{todos.length} completadas
                  </p>
                )}
              </div>
              <span className="text-xl">✅</span>
            </div>

            <div className="flex flex-col px-3 py-1">
              {todos.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">Sin tareas para hoy</p>
              ) : (
                todos.map((todo) => (
                  <label
                    key={todo.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-gray-50"
                  >
                    {/* Custom checkbox visual */}
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition ${
                        todo.completado
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-gray-200 hover:border-brand-300'
                      }`}
                    >
                      {todo.completado && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={todo.completado}
                      onChange={() => handleToggle(todo.id, todo.completado)}
                      className="sr-only"
                    />
                    <span
                      className={`flex-1 text-[13px] font-medium transition ${
                        todo.completado ? 'text-gray-400 line-through' : 'text-brand-900'
                      }`}
                    >
                      {todo.texto}
                    </span>
                  </label>
                ))
              )}
            </div>

            {/* Input nueva tarea */}
            <form
              onSubmit={handleCrearTodo}
              className="flex items-center gap-2 border-t border-gray-100 px-4 py-3"
            >
              <svg className="h-4 w-4 flex-shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" d="M12 4v16m8-8H4" />
              </svg>
              <input
                type="text"
                value={inputTodo}
                onChange={(e) => setInputTodo(e.target.value)}
                placeholder="Agregar tarea..."
                className="flex-1 bg-transparent text-[13px] text-brand-900 outline-none placeholder:font-normal placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={isPending || !inputTodo.trim()}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:opacity-40"
              >
                +
              </button>
            </form>
          </div>

          {/* Próximos eventos */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <p className="font-fraunces text-[15px] font-semibold text-brand-900">Próximos eventos</p>
              <span className="text-xl">📅</span>
            </div>

            <div className="flex flex-col px-5 py-1">
              {eventosProximos.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">Sin eventos próximos</p>
              ) : (
                eventosProximos.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3.5 border-b border-gray-50 py-3 last:border-0"
                  >
                    {/* Hora + día */}
                    <div className="min-w-[42px] text-right">
                      {ev.hora_inicio && (
                        <p className="text-[12px] font-semibold text-brand-600">
                          {formatHora(ev.hora_inicio)}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400">{labelDia(ev.fecha)}</p>
                    </div>
                    {/* Dot */}
                    <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${TIPO_DOT[ev.tipo]}`} />
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-brand-800">{ev.titulo}</p>
                      {ev.locacion && (
                        <p className="mt-0.5 truncate text-xs text-gray-400">{ev.locacion}</p>
                      )}
                    </div>
                    {/* Badge tipo */}
                    <span className="flex-shrink-0 rounded-lg bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                      {TIPO_LABEL[ev.tipo]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Foco de esta semana (solo si hay datos) ───────────────────────── */}
        {(stats.hoy > 0 || stats.semana > 0) && (
          <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Foco hoy</p>
                <p className="font-fraunces text-lg font-bold text-brand-900">{stats.hoy} min</p>
              </div>
            </div>
            <div className="h-7 w-px bg-gray-100" />
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Esta semana</p>
                <p className="font-fraunces text-lg font-bold text-brand-900">
                  {Math.floor(stats.semana / 60) > 0
                    ? `${Math.floor(stats.semana / 60)}h ${stats.semana % 60}m`
                    : `${stats.semana}m`}
                </p>
              </div>
            </div>
            {stats.topMaterias.length > 0 && (
              <>
                <div className="h-7 w-px bg-gray-100" />
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Top materia</p>
                    <p className="max-w-[160px] truncate font-fraunces text-lg font-bold text-brand-900">
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
