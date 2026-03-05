'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { PresetFoco, Materia } from '@/lib/supabase/types'
import type { StatsFoco } from '@/app/(app)/temporizador/actions'
import SesionModal from './SesionModal'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Fase = 'foco' | 'pausa'
type EstadoTimer = 'idle' | 'corriendo' | 'pausado' | 'fin'

interface Bloque {
  fase: Fase
  minutos: number
}

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESETS: Record<Exclude<PresetFoco, 'personalizado'>, { label: string; emoji: string; desc: string; bloques: Bloque[] }> = {
  'pomodoro': {
    label: 'Pomodoro clásico',
    emoji: '🍅',
    desc: '25 min foco · 5 min pausa × 3 + pausa larga',
    bloques: [
      { fase: 'foco', minutos: 25 }, { fase: 'pausa', minutos: 5 },
      { fase: 'foco', minutos: 25 }, { fase: 'pausa', minutos: 5 },
      { fase: 'foco', minutos: 25 }, { fase: 'pausa', minutos: 15 },
    ],
  },
  'deep-work': {
    label: 'Deep Work',
    emoji: '🧠',
    desc: '50 min foco · 10 min pausa × 2',
    bloques: [
      { fase: 'foco', minutos: 50 }, { fase: 'pausa', minutos: 10 },
      { fase: 'foco', minutos: 50 }, { fase: 'pausa', minutos: 10 },
    ],
  },
  'sprint-corto': {
    label: 'Sprint corto',
    emoji: '⚡',
    desc: '15 min foco · 3 min pausa × 3',
    bloques: [
      { fase: 'foco', minutos: 15 }, { fase: 'pausa', minutos: 3 },
      { fase: 'foco', minutos: 15 }, { fase: 'pausa', minutos: 3 },
      { fase: 'foco', minutos: 15 },
    ],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, '0') }
function formatMin(n: number) { return `${Math.floor(n / 60)}h ${n % 60}m` }

// ─── Aro SVG ──────────────────────────────────────────────────────────────────

function TimerRing({ progreso, fase }: { progreso: number; fase: Fase }) {
  const r = 90
  const circ = 2 * Math.PI * r
  const dash = circ * progreso

  return (
    <svg width="220" height="220" viewBox="0 0 220 220" className="rotate-[-90deg]">
      {/* Track */}
      <circle cx="110" cy="110" r={r} fill="none" stroke="currentColor"
        strokeWidth="10" className="text-brand-100" />
      {/* Progress */}
      <circle cx="110" cy="110" r={r} fill="none"
        stroke={fase === 'foco' ? '#7c3aed' : '#0d9488'}
        strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.5s linear' }}
      />
    </svg>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  materias: Pick<Materia, 'id' | 'nombre' | 'estado'>[]
  statsIniciales: StatsFoco
}

export default function TemporizadorClient({ materias, statsIniciales }: Props) {
  const router = useRouter()

  // Preset y bloques personalizados
  const [preset, setPreset] = useState<PresetFoco>('pomodoro')
  const [bloquesCustom, setBloquesCustom] = useState<Bloque[]>([
    { fase: 'foco', minutos: 25 }, { fase: 'pausa', minutos: 5 },
  ])

  // Timer
  const [estado, setEstado] = useState<EstadoTimer>('idle')
  const [bloqueIdx, setBloqueIdx] = useState(0)
  const [segundosRestantes, setSegundosRestantes] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Materia seleccionada
  const [materiaId, setMateriaId] = useState<string>('')

  // Stats
  const [stats, setStats] = useState<StatsFoco>(statsIniciales)

  // Modal sesión
  const [showModal, setShowModal] = useState(false)
  const minutosFocoRef = useRef(0)

  // ── Bloques activos ─────────────────────────────────────────────────────────
  const bloques: Bloque[] = preset === 'personalizado'
    ? bloquesCustom
    : PRESETS[preset as keyof typeof PRESETS].bloques

  const bloqueActual = bloques[bloqueIdx] ?? bloques[0]

  // ── Segundos totales del bloque actual ──────────────────────────────────────
  const segundosTotales = bloqueActual.minutos * 60

  // ── Progreso del aro (0 → 1) ────────────────────────────────────────────────
  const progreso = segundosTotales > 0
    ? 1 - segundosRestantes / segundosTotales
    : 0

  // ── Limpiar interval al desmontar ───────────────────────────────────────────
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  // ── Avanzar bloque o terminar sesión ────────────────────────────────────────
  const avanzarBloque = useCallback(() => {
    const sig = bloqueIdx + 1
    if (sig < bloques.length) {
      setBloqueIdx(sig)
      setSegundosRestantes(bloques[sig].minutos * 60)
    } else {
      // Sesión completada
      if (intervalRef.current) clearInterval(intervalRef.current)
      setEstado('fin')
      setShowModal(true)
    }
  }, [bloqueIdx, bloques])

  // ── Tick ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (estado !== 'corriendo') return

    intervalRef.current = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) {
          // Contabilizar si era bloque de foco
          if (bloqueActual.fase === 'foco') {
            minutosFocoRef.current += bloqueActual.minutos
          }
          avanzarBloque()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [estado, bloqueActual, avanzarBloque])

  // ── Iniciar ─────────────────────────────────────────────────────────────────
  function handleStart() {
    minutosFocoRef.current = 0
    setBloqueIdx(0)
    setSegundosRestantes(bloques[0].minutos * 60)
    setEstado('corriendo')
  }

  // ── Pausa / Reanudar ────────────────────────────────────────────────────────
  function handlePauseResume() {
    if (estado === 'corriendo') {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setEstado('pausado')
    } else if (estado === 'pausado') {
      setEstado('corriendo')
    }
  }

  // ── Stop ────────────────────────────────────────────────────────────────────
  function handleStop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    // Sumar tiempo parcial del bloque actual de foco
    if (bloqueActual.fase === 'foco') {
      const parcial = Math.floor((segundosTotales - segundosRestantes) / 60)
      minutosFocoRef.current += parcial
    }
    setEstado('fin')
    setShowModal(true)
  }

  // ── Reset (después del modal) ────────────────────────────────────────────────
  function handleReset() {
    setEstado('idle')
    setBloqueIdx(0)
    setSegundosRestantes(0)
    minutosFocoRef.current = 0
  }

  // ── Bloques personalizados ───────────────────────────────────────────────────
  function addBloque(fase: Fase) {
    setBloquesCustom(prev => [...prev, { fase, minutos: fase === 'foco' ? 25 : 5 }])
  }
  function removeBloque(i: number) {
    setBloquesCustom(prev => prev.filter((_, idx) => idx !== i))
  }
  function updateBloqueMin(i: number, val: string) {
    const n = Math.max(1, Math.min(120, parseInt(val) || 1))
    setBloquesCustom(prev => prev.map((b, idx) => idx === i ? { ...b, minutos: n } : b))
  }

  // ── Display ─────────────────────────────────────────────────────────────────
  const mins = Math.floor(segundosRestantes / 60)
  const secs = segundosRestantes % 60
  const displayTime = estado === 'idle'
    ? `${pad(bloques[0]?.minutos ?? 0)}:00`
    : `${pad(mins)}:${pad(secs)}`

  const bloqueLabel = bloqueActual?.fase === 'foco' ? 'FOCO' : 'PAUSA'
  const boqueLabelColor = bloqueActual?.fase === 'foco' ? 'text-brand-600' : 'text-teal-600'

  return (
    <>
      <div className="flex gap-8 flex-col lg:flex-row">

        {/* ── Columna izquierda ─────────────────────────────────────────────── */}
        <div className="flex-[2] flex flex-col gap-6">

          {/* Selector de preset */}
          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="mb-3 font-fraunces text-sm font-semibold text-brand-900">Modo de estudio</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.entries(PRESETS) as [keyof typeof PRESETS, typeof PRESETS[keyof typeof PRESETS]][]).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  disabled={estado === 'corriendo' || estado === 'pausado'}
                  onClick={() => setPreset(key)}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    preset === key
                      ? 'border-brand-400 bg-brand-50 shadow-sm'
                      : 'border-brand-100 bg-white hover:border-brand-200 hover:bg-brand-50'
                  }`}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-[11px] font-bold text-brand-900 leading-tight">{p.label}</span>
                  <span className="text-[10px] text-brand-400 leading-tight">{p.desc}</span>
                </button>
              ))}
              {/* Personalizado */}
              <button
                type="button"
                disabled={estado === 'corriendo' || estado === 'pausado'}
                onClick={() => setPreset('personalizado')}
                className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  preset === 'personalizado'
                    ? 'border-brand-400 bg-brand-50 shadow-sm'
                    : 'border-brand-100 bg-white hover:border-brand-200 hover:bg-brand-50'
                }`}
              >
                <span className="text-xl">✏️</span>
                <span className="text-[11px] font-bold text-brand-900">Personalizado</span>
                <span className="text-[10px] text-brand-400">Definí tus bloques</span>
              </button>
            </div>

            {/* Editor bloques custom */}
            {preset === 'personalizado' && (
              <div className="mt-4 border-t border-brand-100 pt-4">
                <p className="mb-2 text-xs font-semibold text-brand-500">Bloques de sesión</p>
                <div className="flex flex-col gap-1.5">
                  {bloquesCustom.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`w-14 rounded-lg px-2 py-1 text-center text-[11px] font-bold ${
                        b.fase === 'foco' ? 'bg-brand-100 text-brand-700' : 'bg-teal-50 text-teal-700'
                      }`}>
                        {b.fase === 'foco' ? 'FOCO' : 'PAUSA'}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={b.minutos}
                        disabled={estado !== 'idle'}
                        onChange={e => updateBloqueMin(i, e.target.value)}
                        className="w-16 rounded-lg border border-brand-200 px-2 py-1 text-center text-sm font-semibold text-brand-900 outline-none focus:border-brand-400 disabled:opacity-50"
                      />
                      <span className="text-xs text-brand-400">min</span>
                      <button
                        type="button"
                        disabled={estado !== 'idle' || bloquesCustom.length <= 1}
                        onClick={() => removeBloque(i)}
                        className="ml-auto text-brand-300 hover:text-red-400 disabled:opacity-30"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={estado !== 'idle'}
                    onClick={() => addBloque('foco')}
                    className="flex items-center gap-1 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-40"
                  >
                    + Foco
                  </button>
                  <button
                    type="button"
                    disabled={estado !== 'idle'}
                    onClick={() => addBloque('pausa')}
                    className="flex items-center gap-1 rounded-lg border border-teal-200 px-3 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 disabled:opacity-40"
                  >
                    + Pausa
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Timer display */}
          <div className="flex flex-col items-center rounded-2xl border border-brand-100 bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {/* Indicador de bloque */}
            {estado !== 'idle' && (
              <p className="mb-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">
                Bloque {bloqueIdx + 1} de {bloques.length}
              </p>
            )}

            {/* Aro + tiempo */}
            <div className="relative flex items-center justify-center">
              <TimerRing progreso={estado === 'idle' ? 0 : progreso} fase={bloqueActual?.fase ?? 'foco'} />
              <div className="absolute flex flex-col items-center">
                {estado !== 'idle' && (
                  <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${boqueLabelColor}`}>
                    {bloqueLabel}
                  </span>
                )}
                <span className="font-fraunces text-5xl font-bold text-brand-900 tabular-nums">
                  {displayTime}
                </span>
                {estado === 'pausado' && (
                  <span className="text-xs text-brand-400 mt-1">pausado</span>
                )}
              </div>
            </div>

            {/* Controles */}
            <div className="mt-6 flex items-center gap-3">
              {estado === 'idle' ? (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={bloques.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(124,58,237,0.4)] transition hover:-translate-y-px hover:bg-brand-600 disabled:opacity-40"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Iniciar
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePauseResume}
                    className="flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    {estado === 'corriendo'
                      ? <><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>Pausar</>
                      : <><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Reanudar</>
                    }
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                    Detener
                  </button>
                </>
              )}
            </div>

            {/* Secuencia de bloques */}
            {estado !== 'idle' && (
              <div className="mt-5 flex items-center gap-1.5">
                {bloques.map((b, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i < bloqueIdx
                        ? 'w-4 bg-brand-300'
                        : i === bloqueIdx
                          ? 'w-6 ' + (b.fase === 'foco' ? 'bg-brand-500' : 'bg-teal-500')
                          : 'w-4 bg-brand-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Columna derecha ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Selector de materia */}
          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="mb-2 font-fraunces text-sm font-semibold text-brand-900">¿Qué estás estudiando?</p>
            <select
              value={materiaId}
              onChange={e => setMateriaId(e.target.value)}
              className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-900 outline-none focus:border-brand-400"
            >
              <option value="">Sin materia</option>
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* Stats de foco */}
          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="mb-4 font-fraunces text-sm font-semibold text-brand-900">Tu progreso</p>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">Hoy</p>
                  <p className="font-fraunces text-xl font-bold text-brand-900">{stats.hoy} min</p>
                </div>
                <span className="text-2xl">🎯</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">Esta semana</p>
                  <p className="font-fraunces text-xl font-bold text-brand-900">{formatMin(stats.semana)}</p>
                </div>
                <span className="text-2xl">📅</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-400">Racha</p>
                  <p className="font-fraunces text-xl font-bold text-orange-700">{stats.racha} día{stats.racha !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-2xl">🔥</span>
              </div>
            </div>

            {/* Top materias */}
            {stats.topMaterias.length > 0 && (
              <div className="mt-4 border-t border-brand-100 pt-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-400">Top materias (30 días)</p>
                <div className="flex flex-col gap-2">
                  {stats.topMaterias.slice(0, 3).map((m, i) => {
                    const max = stats.topMaterias[0].minutos
                    return (
                      <div key={m.materiaId}>
                        <div className="mb-0.5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-brand-700 truncate max-w-[140px]">{m.nombre}</span>
                          <span className="text-xs text-brand-400">{m.minutos} min</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-brand-100">
                          <div
                            className="h-1.5 rounded-full bg-brand-400"
                            style={{ width: `${(m.minutos / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <SesionModal
        open={showModal}
        minutosFoco={minutosFocoRef.current}
        preset={preset}
        materias={materias}
        materiaIdInicial={materiaId}
        onGuardar={async (duracion, mat, completada) => {
          const { guardarSesion } = await import('@/app/(app)/temporizador/actions')
          await guardarSesion(duracion, preset, mat || null, completada)
          router.refresh()
          setStats(prev => ({ ...prev, hoy: prev.hoy + duracion }))
        }}
        onClose={() => {
          setShowModal(false)
          handleReset()
        }}
      />
    </>
  )
}
