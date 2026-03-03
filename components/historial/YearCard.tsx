'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { AnioData, MateriaConNotas } from './types'
import EditMateriaModal from './EditMateriaModal'
import type { EstadoMateria } from '@/lib/supabase/types'

const ORDINAL = ['', 'Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto']
const CUATRI_COLOR = ['', '#7c3aed', '#0d9488']

// Colores para notas
function notaColor(n: number | null): string {
  if (n === null) return 'text-brand-300 italic font-normal'
  if (n >= 7) return 'text-green-600 font-bold'
  if (n >= 5) return 'text-amber-600 font-bold'
  return 'text-red-600 font-bold'
}

function fmt(n: number | null): string {
  if (n === null) return '—'
  return n % 1 === 0 ? n.toString() : n.toFixed(2)
}

type EstadoBadgeProps = { estado: EstadoMateria }
function EstadoBadge({ estado }: EstadoBadgeProps) {
  const map: Record<EstadoMateria, { label: string; cls: string }> = {
    pendiente:       { label: '○ Pendiente',        cls: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    aprobada:        { label: '✓ Aprobada',         cls: 'bg-green-50 text-green-700 border border-green-200' },
    promocionada:    { label: '⭐ Promocionada',    cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
    cursando:        { label: '● En curso',          cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
    final_pendiente: { label: '⏳ Final pendiente',  cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    libre:           { label: '✗ Libre',             cls: 'bg-red-50 text-red-700 border border-red-200' },
  }
  const { label, cls } = map[estado]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold', cls)}>
      {label}
    </span>
  )
}

interface CuatriTableProps {
  materias: MateriaConNotas[]
  cuatrimestre: 1 | 2
  promedio: number | null
  anio: number
  onEdit: (m: MateriaConNotas) => void
  onAgregar: (anio: number, cuatri: 1 | 2) => void
}

function CuatriTable({ materias, cuatrimestre, promedio, anio, onEdit, onAgregar }: CuatriTableProps) {
  const emoji = cuatrimestre === 1 ? '📘' : '📗'
  return (
    <div className="px-6 pb-2">
      <div className="flex items-center justify-between border-b border-brand-100 py-4">
        <span className="text-[13px] font-bold uppercase tracking-wider text-brand-500">
          {emoji} Cuatrimestre {cuatrimestre}
        </span>
        {promedio !== null && (
          <span className="text-xs font-semibold text-brand-300">
            Promedio: {fmt(promedio)}
          </span>
        )}
      </div>

      <table className="mb-4 w-full border-collapse">
        <thead>
          <tr>
            {['Materia','P1','P2','Recup.','Final','Cursada','Estado',''].map((h, i) => (
              <th key={i} className={cn(
                'py-2 text-[11px] font-semibold uppercase tracking-wider text-brand-300',
                i === 0 ? 'w-[30%] text-left' : i === 7 ? 'w-[4%]' : 'w-[11%] text-center'
              )}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {materias.map((m) => (
            <tr key={m.id} className="group border-b border-brand-50 transition hover:bg-brand-50/60">
              <td className="py-3 pr-3 text-[13px] font-semibold text-brand-900">{m.nombre}</td>
              <td className={cn('py-3 text-center text-[13px]', notaColor(m.notas?.p1 ?? null))}>{fmt(m.notas?.p1 ?? null)}</td>
              <td className={cn('py-3 text-center text-[13px]', notaColor(m.notas?.p2 ?? null))}>{fmt(m.notas?.p2 ?? null)}</td>
              <td className={cn('py-3 text-center text-[13px]', notaColor(m.notas?.recuperatorio ?? null))}>{fmt(m.notas?.recuperatorio ?? null)}</td>
              <td className={cn('py-3 text-center text-[13px]', notaColor(m.notas?.final ?? null))}>{fmt(m.notas?.final ?? null)}</td>
              <td className={cn('py-3 text-center text-[13px]', notaColor(m.notas?.cursada ?? null))}>{fmt(m.notas?.cursada ?? null)}</td>
              <td className="py-3 text-center"><EstadoBadge estado={m.estado} /></td>
              <td className="py-3 text-center">
                <button
                  onClick={() => onEdit(m)}
                  className="rounded-lg p-1 text-brand-200 opacity-0 transition hover:bg-brand-100 hover:text-brand-500 group-hover:opacity-100"
                  title="Editar notas"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => onAgregar(anio, cuatrimestre)}
        className="mb-4 flex items-center gap-1.5 rounded-xl border border-dashed border-brand-300 px-4 py-2 text-[12px] font-semibold text-brand-500 transition hover:border-brand-500 hover:bg-brand-50"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M12 4v16m8-8H4" />
        </svg>
        Agregar materia
      </button>
    </div>
  )
}

interface YearCardProps {
  data: AnioData
  defaultOpen?: boolean
}

export default function YearCard({ data, defaultOpen = false }: YearCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [editMateria, setEditMateria] = useState<MateriaConNotas | null>(null)
  const [agregarConfig, setAgregarConfig] = useState<{ anio: number; cuatri: 1 | 2 } | null>(null)

  const enCurso = data.cuatrimestres.some(c =>
    c.materias.some(m => m.estado === 'cursando')
  )

  return (
    <>
      <div className={cn(
        'overflow-hidden rounded-2xl border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
        enCurso ? 'border-brand-300' : 'border-brand-100'
      )}>
        {/* Header */}
        <div
          className="flex cursor-pointer select-none items-center justify-between px-6 py-5"
          onClick={() => setOpen(o => !o)}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 shadow-[0_4px_10px_rgba(124,58,237,0.3)]">
              <span className="font-fraunces text-base font-bold text-white">{data.anio}°</span>
            </div>
            <div>
              <p className="font-fraunces text-[18px] font-semibold text-brand-900">
                {ORDINAL[data.anio]} Año
              </p>
              <p className={cn('mt-0.5 text-xs', enCurso ? 'font-semibold text-blue-600' : 'text-brand-400')}>
                {enCurso
                  ? `🔵 En curso · ${data.cuatrimestres.flatMap(c => c.materias).filter(m => m.estado === 'cursando').length} materias activas`
                  : `${data.aprobadas} materia${data.aprobadas !== 1 ? 's' : ''} aprobada${data.aprobadas !== 1 ? 's' : ''} · Promedio ${fmt(data.promedio)}`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Mini stats */}
            <div className="flex gap-5">
              <div className="text-center">
                <p className="font-fraunces text-lg font-bold text-green-600">{data.aprobadas}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-300">Aprobadas</p>
              </div>
              <div className="text-center">
                <p className="font-fraunces text-lg font-bold text-purple-700">{data.promocionadas}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-300">Promovidas</p>
              </div>
              <div className="text-center">
                <p className="font-fraunces text-lg font-bold text-brand-900">{fmt(data.promedio)}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-300">Promedio</p>
              </div>
            </div>
            {/* Chevron */}
            <svg
              className={cn('h-5 w-5 text-brand-300 transition-transform duration-300', open && 'rotate-180')}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Body */}
        {open && (
          <div className="border-t border-brand-100">
            {data.cuatrimestres.map((c) => (
              <CuatriTable
                key={c.cuatrimestre}
                materias={c.materias}
                cuatrimestre={c.cuatrimestre}
                promedio={c.promedio}
                anio={data.anio}
                onEdit={setEditMateria}
                onAgregar={(anio, cuatri) => setAgregarConfig({ anio, cuatri })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal editar */}
      {editMateria && (
        <EditMateriaModal
          open={true}
          onClose={() => setEditMateria(null)}
          materia={editMateria}
        />
      )}

      {/* Modal agregar */}
      {agregarConfig && (
        <EditMateriaModal
          open={true}
          onClose={() => setAgregarConfig(null)}
          anioDefault={agregarConfig.anio}
          cuatriDefault={agregarConfig.cuatri}
        />
      )}
    </>
  )
}
