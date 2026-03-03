'use client'

import { useTransition } from 'react'
import type { MateriaConNotas } from './types'
import type { EstadoMateria } from '@/lib/supabase/types'
import { guardarNotas, agregarMateria } from '@/app/(app)/historial/actions'

interface EditMateriaModalProps {
  open: boolean
  onClose: () => void
  materia?: MateriaConNotas          // edición — si viene, modo editar
  // agregar materia nueva:
  anioDefault?: number
  cuatriDefault?: 1 | 2
}

const ESTADOS: { value: EstadoMateria; label: string }[] = [
  { value: 'pendiente',       label: 'Pendiente (no cursada)' },
  { value: 'cursando',        label: 'En curso' },
  { value: 'aprobada',        label: 'Aprobada' },
  { value: 'promocionada',    label: 'Promocionada' },
  { value: 'final_pendiente', label: 'Final pendiente' },
  { value: 'libre',           label: 'Libre' },
]

function NotaInput({ name, label, defaultValue }: { name: string; label: string; defaultValue?: number | null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">{label}</label>
      <input
        name={name}
        type="number"
        min="0"
        max="10"
        step="0.01"
        defaultValue={defaultValue ?? ''}
        placeholder="—"
        className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  )
}

export default function EditMateriaModal({
  open,
  onClose,
  materia,
  anioDefault,
  cuatriDefault,
}: EditMateriaModalProps) {
  const [isPending, startTransition] = useTransition()
  const esEdicion = !!materia

  if (!open) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      if (esEdicion && materia) {
        await guardarNotas(materia.id, formData)
      } else {
        await agregarMateria(formData)
      }
      onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-[440px] rounded-2xl bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <h2 className="font-fraunces text-xl font-semibold text-brand-900">
          {esEdicion ? materia.nombre : 'Agregar materia'}
        </h2>
        <p className="mt-1 mb-6 text-sm text-brand-400">
          {esEdicion ? 'Cargá o actualizá las notas.' : 'Completá los datos de la materia.'}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Nombre — solo al agregar */}
          {!esEdicion && (
            <div className="mb-4 flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">Nombre</label>
              <input
                name="nombre"
                type="text"
                required
                placeholder="Ej: Genética Molecular"
                className="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          )}

          {/* Año y cuatrimestre — solo al agregar */}
          {!esEdicion && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">Año</label>
                <select name="anio" defaultValue={anioDefault ?? 1} className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900 outline-none">
                  {[1,2,3,4,5].map(a => <option key={a} value={a}>{a}°</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">Cuatrimestre</label>
                <select name="cuatrimestre" defaultValue={cuatriDefault ?? 1} className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900 outline-none">
                  <option value={1}>1°</option>
                  <option value={2}>2°</option>
                </select>
              </div>
            </div>
          )}

          {/* Estado */}
          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">Estado</label>
            <select
              name="estado"
              defaultValue={materia?.estado ?? 'cursando'}
              className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900 outline-none transition focus:border-brand-500"
            >
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          {/* Notas — grid 2×3 */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <NotaInput name="p1"            label="Parcial 1"      defaultValue={materia?.notas?.p1} />
            <NotaInput name="p2"            label="Parcial 2"      defaultValue={materia?.notas?.p2} />
            <NotaInput name="recuperatorio" label="Recuperatorio"  defaultValue={materia?.notas?.recuperatorio} />
            <NotaInput name="cursada"       label="Nota cursada"   defaultValue={materia?.notas?.cursada} />
            <NotaInput name="final"         label="Final"          defaultValue={materia?.notas?.final} />
          </div>

          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={onClose} disabled={isPending}
              className="rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isPending}
              className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition hover:bg-brand-600 disabled:opacity-50">
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
