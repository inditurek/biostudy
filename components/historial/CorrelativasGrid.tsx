import { cn } from '@/lib/utils'
import type { AnioData, MateriaConNotas } from './types'
import type { EstadoMateria } from '@/lib/supabase/types'
import { CORRELATIVAS, estaDesbloqueada } from '@/lib/data/correlativas'

// ── Tipo de display (incluye estado derivado "bloqueada") ─────────────────────

type EstadoDisplay = EstadoMateria | 'bloqueada'

// ── Colores y etiquetas por estado ──────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoDisplay, { bg: string; border: string; dot: string; label: string }> = {
  pendiente:       { bg: 'bg-yellow-50',  border: 'border-yellow-200', dot: 'bg-yellow-400', label: '○ Pendiente' },
  bloqueada:       { bg: 'bg-gray-50',    border: 'border-gray-200',   dot: 'bg-gray-300',   label: '🔒 Bloqueada' },
  aprobada:        { bg: 'bg-green-50',   border: 'border-green-200',  dot: 'bg-green-500',  label: '✓ Aprobada' },
  promocionada:    { bg: 'bg-purple-50',  border: 'border-purple-200', dot: 'bg-purple-600', label: '⭐ Promovida' },
  cursando:        { bg: 'bg-blue-50',    border: 'border-blue-200',   dot: 'bg-blue-500',   label: '● En curso' },
  final_pendiente: { bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-500',  label: '⏳ Final pend.' },
  libre:           { bg: 'bg-red-50',     border: 'border-red-200',    dot: 'bg-red-500',    label: '✗ Libre' },
}

function fmt(n: number | null): string {
  if (n === null) return '—'
  return n % 1 === 0 ? n.toString() : n.toFixed(2)
}

function notaResumen(m: MateriaConNotas): string {
  if (!m.notas) return ''
  if (m.notas.final !== null) return `Final: ${fmt(m.notas.final)}`
  if (m.notas.cursada !== null) return `Cursada: ${fmt(m.notas.cursada)}`
  if (m.notas.p1 !== null) return `P1: ${fmt(m.notas.p1)}`
  return ''
}

// ── Leyenda ──────────────────────────────────────────────────────────────────

function Leyenda() {
  const items: [EstadoDisplay, string][] = [
    ['aprobada',        'Aprobada'],
    ['promocionada',    'Promocionada'],
    ['cursando',        'En curso'],
    ['final_pendiente', 'Final pendiente'],
    ['pendiente',       'Pendiente'],
    ['bloqueada',       'Bloqueada'],
    ['libre',           'Libre'],
  ]
  return (
    <div className="mb-8 flex flex-wrap gap-4">
      {items.map(([estado, label]) => {
        const cfg = ESTADO_CONFIG[estado]
        return (
          <div key={estado} className="flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-full', cfg.dot)} />
            <span className="text-[12px] font-medium text-brand-500">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Tarjeta de materia ───────────────────────────────────────────────────────

interface MateriaCardProps {
  m: MateriaConNotas
  estadoMap: Record<string, EstadoMateria>
}

function MateriaCard({ m, estadoMap }: MateriaCardProps) {
  // Determinar si la materia está bloqueada por correlativas
  const prereqs = CORRELATIVAS[m.nombre] ?? []
  const bloqueada =
    m.estado === 'pendiente' &&
    prereqs.length > 0 &&
    !estaDesbloqueada(m.nombre, estadoMap)

  const display: EstadoDisplay = bloqueada ? 'bloqueada' : m.estado
  const cfg = ESTADO_CONFIG[display]
  const resumen = notaResumen(m)

  // Tooltip con los prerequisitos bloqueantes
  const prereqsBloqueantes = bloqueada
    ? prereqs.filter((p) => {
        const e = estadoMap[p]
        return !e || (e !== 'aprobada' && e !== 'promocionada')
      })
    : []

  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition hover:shadow-sm',
        cfg.bg,
        cfg.border,
        bloqueada && 'opacity-70'
      )}
      title={
        prereqsBloqueantes.length > 0
          ? `Requiere: ${prereqsBloqueantes.join(', ')}`
          : undefined
      }
    >
      <div className="flex items-start gap-2">
        <span className={cn('mt-1 h-2 w-2 flex-shrink-0 rounded-full', cfg.dot)} />
        <div className="min-w-0">
          <p className={cn(
            'text-[12px] font-semibold leading-tight line-clamp-2',
            bloqueada ? 'text-gray-400' : 'text-brand-900'
          )}>
            {m.nombre}
          </p>
          {resumen && !bloqueada && (
            <p className="mt-1 text-[11px] text-brand-400">{resumen}</p>
          )}
          {bloqueada && prereqsBloqueantes.length > 0 && (
            <p className="mt-1 text-[10px] text-gray-400 leading-tight">
              Falta: {prereqsBloqueantes[0]}{prereqsBloqueantes.length > 1 ? ` +${prereqsBloqueantes.length - 1}` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Columna por año/cuatrimestre ─────────────────────────────────────────────

const ORDINAL = ['', 'Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto']
const CUATRI_EMOJI = ['', '📘', '📗']

interface ColumnaAnioProps {
  data: AnioData
  estadoMap: Record<string, EstadoMateria>
}

function ColumnaAnio({ data, estadoMap }: ColumnaAnioProps) {
  const totalMaterias = data.cuatrimestres.flatMap(c => c.materias).length
  const aprobadas = data.aprobadas + data.promocionadas

  return (
    <div className="min-w-[180px] max-w-[220px] flex-1">
      {/* Header del año */}
      <div className="mb-3 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 px-3 py-2.5 shadow-[0_4px_10px_rgba(124,58,237,0.2)]">
        <p className="font-fraunces text-[13px] font-bold text-white">{ORDINAL[data.anio]} Año</p>
        <p className="mt-0.5 text-[10px] font-medium text-white/70">
          {aprobadas}/{totalMaterias} materias · Prom. {fmt(data.promedio)}
        </p>
      </div>

      {/* Cuatrimestres */}
      {data.cuatrimestres.map((c) => (
        <div key={c.cuatrimestre} className="mb-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-300">
            {CUATRI_EMOJI[c.cuatrimestre]} {c.cuatrimestre}° Cuatrimestre
          </p>
          <div className="flex flex-col gap-1.5">
            {c.materias.map((m) => (
              <MateriaCard key={m.id} m={m} estadoMap={estadoMap} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

interface CorrelativasGridProps {
  anios: AnioData[]
}

export default function CorrelativasGrid({ anios }: CorrelativasGridProps) {
  if (anios.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-200 px-8 py-16 text-center">
        <p className="text-brand-400">No hay materias para mostrar.</p>
      </div>
    )
  }

  // Construir mapa global nombre → estado para evaluar correlativas
  const estadoMap: Record<string, EstadoMateria> = {}
  for (const anio of anios) {
    for (const cuatri of anio.cuatrimestres) {
      for (const m of cuatri.materias) {
        estadoMap[m.nombre] = m.estado
      }
    }
  }

  return (
    <div>
      <Leyenda />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {anios.map((data) => (
          <ColumnaAnio key={data.anio} data={data} estadoMap={estadoMap} />
        ))}
      </div>
    </div>
  )
}
