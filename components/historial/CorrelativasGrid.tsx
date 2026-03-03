import { cn } from '@/lib/utils'
import type { AnioData, MateriaConNotas } from './types'
import type { EstadoMateria } from '@/lib/supabase/types'

// ── Colores y etiquetas por estado ──────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoMateria, { bg: string; border: string; dot: string; label: string }> = {
  pendiente:       { bg: 'bg-brand-50',  border: 'border-brand-200',  dot: 'bg-brand-300',  label: '○ Disponible' },
  aprobada:        { bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500',  label: '✓ Aprobada' },
  promocionada:    { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-600', label: '⭐ Promovida' },
  cursando:        { bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500',   label: '● En curso' },
  final_pendiente: { bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-500',  label: '⏳ Final pend.' },
  libre:           { bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    label: '✗ Libre' },
}

// Materia pendiente que no se puede cursar todavía (año posterior al activo)
const BLOQUEADA_CONFIG = {
  bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-300', label: '🔒 Bloqueada',
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

function Leyenda({ hayBloqueadas }: { hayBloqueadas: boolean }) {
  const items: Array<[EstadoMateria | 'bloqueada', string]> = [
    ['aprobada',        'Aprobada'],
    ['promocionada',    'Promocionada'],
    ['cursando',        'En curso'],
    ['final_pendiente', 'Final pendiente'],
    ['pendiente',       'Disponible'],
    ...(hayBloqueadas ? [['bloqueada', 'Bloqueada'] as ['bloqueada', string]] : []),
    ['libre',           'Libre'],
  ]

  const dotColor = (key: EstadoMateria | 'bloqueada') =>
    key === 'bloqueada' ? BLOQUEADA_CONFIG.dot : ESTADO_CONFIG[key as EstadoMateria].dot

  return (
    <div className="mb-8 flex flex-wrap gap-4">
      {items.map(([key, label]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className={cn('h-2.5 w-2.5 rounded-full', dotColor(key))} />
          <span className="text-[12px] font-medium text-brand-500">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Tarjeta de materia ───────────────────────────────────────────────────────

function MateriaCard({ m, bloqueada }: { m: MateriaConNotas; bloqueada: boolean }) {
  const cfg = bloqueada ? BLOQUEADA_CONFIG : ESTADO_CONFIG[m.estado]
  const resumen = notaResumen(m)

  return (
    <div className={cn(
      'rounded-xl border p-3 transition',
      bloqueada ? 'opacity-60' : 'hover:shadow-sm',
      cfg.bg,
      cfg.border,
    )}>
      <div className="flex items-start gap-2">
        <span className={cn('mt-1 h-2 w-2 flex-shrink-0 rounded-full', cfg.dot)} />
        <div className="min-w-0">
          <p className={cn(
            'text-[12px] font-semibold leading-tight line-clamp-2',
            bloqueada ? 'text-gray-400' : 'text-brand-900'
          )}>
            {m.nombre}
          </p>
          {resumen && (
            <p className="mt-1 text-[11px] text-brand-400">{resumen}</p>
          )}
          {bloqueada && (
            <p className="mt-1 text-[11px] text-gray-400">Requiere correlativas</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Columna por año/cuatrimestre ─────────────────────────────────────────────

const ORDINAL = ['', 'Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto']
const CUATRI_EMOJI = ['', '📘', '📗']

function ColumnaAnio({ data, anioActivo }: { data: AnioData; anioActivo: number }) {
  const totalMaterias = data.cuatrimestres.flatMap(c => c.materias).length
  const aprobadas = data.aprobadas + data.promocionadas
  // Un año está "bloqueado" si es posterior al año activo
  const anoBloqueado = data.anio > anioActivo + 1

  return (
    <div className="min-w-[180px] max-w-[220px] flex-1">
      {/* Header del año */}
      <div className={cn(
        'mb-3 rounded-xl px-3 py-2.5 shadow-[0_4px_10px_rgba(0,0,0,0.08)]',
        anoBloqueado
          ? 'bg-gray-200'
          : 'bg-gradient-to-br from-brand-700 to-brand-500 shadow-[0_4px_10px_rgba(124,58,237,0.2)]'
      )}>
        <p className={cn('font-fraunces text-[13px] font-bold', anoBloqueado ? 'text-gray-500' : 'text-white')}>
          {ORDINAL[data.anio]} Año
        </p>
        <p className={cn('mt-0.5 text-[10px] font-medium', anoBloqueado ? 'text-gray-400' : 'text-white/70')}>
          {anoBloqueado
            ? 'Bloqueado'
            : `${aprobadas}/${totalMaterias} materias · Prom. ${fmt(data.promedio)}`
          }
        </p>
      </div>

      {/* Cuatrimestres */}
      {data.cuatrimestres.map((c) => (
        <div key={c.cuatrimestre} className="mb-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-300">
            {CUATRI_EMOJI[c.cuatrimestre]} {c.cuatrimestre}° Cuatrimestre
          </p>
          <div className="flex flex-col gap-1.5">
            {c.materias.map((m) => {
              // Bloqueada si el año está bloqueado Y la materia no fue cursada nunca
              const esBloqueada = anoBloqueado && m.estado === 'pendiente'
              return <MateriaCard key={m.id} m={m} bloqueada={esBloqueada} />
            })}
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

  // Año activo = el año más avanzado con materias en curso o terminadas
  const anioActivo = anios.reduce((max, a) => {
    const tieneActividad = a.cuatrimestres.some(c =>
      c.materias.some(m => m.estado !== 'pendiente')
    )
    return tieneActividad ? Math.max(max, a.anio) : max
  }, 1)

  const hayBloqueadas = anios.some(a => a.anio > anioActivo + 1)

  return (
    <div>
      <Leyenda hayBloqueadas={hayBloqueadas} />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {anios.map((data) => (
          <ColumnaAnio key={data.anio} data={data} anioActivo={anioActivo} />
        ))}
      </div>
    </div>
  )
}
