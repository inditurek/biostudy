import { cn } from '@/lib/utils'
import type { AnioData, MateriaConNotas } from './types'
import type { EstadoMateria } from '@/lib/supabase/types'

// ── Colores y etiquetas por estado ──────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoMateria, { bg: string; border: string; dot: string; label: string }> = {
  aprobada:        { bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500',  label: '✓ Aprobada' },
  promocionada:    { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-600', label: '⭐ Promovida' },
  cursando:        { bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500',   label: '● En curso' },
  final_pendiente: { bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-500',  label: '⏳ Final pend.' },
  libre:           { bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    label: '✗ Libre' },
}

function fmt(n: number | null): string {
  if (n === null) return '—'
  return n % 1 === 0 ? n.toString() : n.toFixed(2)
}

function notaResumen(m: MateriaConNotas): string {
  if (!m.notas) return 'Sin notas'
  if (m.notas.final !== null) return `Final: ${fmt(m.notas.final)}`
  if (m.notas.cursada !== null) return `Cursada: ${fmt(m.notas.cursada)}`
  if (m.notas.p1 !== null) return `P1: ${fmt(m.notas.p1)}`
  return 'Sin notas'
}

// ── Leyenda ──────────────────────────────────────────────────────────────────

function Leyenda() {
  const items: [EstadoMateria, string][] = [
    ['aprobada',        'Aprobada'],
    ['promocionada',    'Promocionada'],
    ['cursando',        'En curso'],
    ['final_pendiente', 'Final pendiente'],
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

function MateriaCard({ m }: { m: MateriaConNotas }) {
  const cfg = ESTADO_CONFIG[m.estado]
  return (
    <div className={cn(
      'rounded-xl border p-3 transition hover:shadow-sm',
      cfg.bg,
      cfg.border,
    )}>
      <div className="flex items-start gap-2">
        <span className={cn('mt-1 h-2 w-2 flex-shrink-0 rounded-full', cfg.dot)} />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold leading-tight text-brand-900 line-clamp-2">
            {m.nombre}
          </p>
          <p className="mt-1 text-[11px] text-brand-400">{notaResumen(m)}</p>
        </div>
      </div>
    </div>
  )
}

// ── Columna por año/cuatrimestre ─────────────────────────────────────────────

const ORDINAL = ['', 'Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto']
const CUATRI_EMOJI = ['', '📘', '📗']

function ColumnaAnio({ data }: { data: AnioData }) {
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
              <MateriaCard key={m.id} m={m} />
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

  return (
    <div>
      <Leyenda />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {anios.map((data) => (
          <ColumnaAnio key={data.anio} data={data} />
        ))}
      </div>
    </div>
  )
}
