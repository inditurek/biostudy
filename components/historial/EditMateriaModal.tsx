'use client'

import { useState, useTransition } from 'react'
import type { MateriaConNotas } from './types'
import type { EstadoMateria } from '@/lib/supabase/types'
import { guardarNotas, agregarMateria } from '@/app/(app)/historial/actions'

interface EditMateriaModalProps {
  open: boolean
  onClose: () => void
  materia?: MateriaConNotas
  anioDefault?: number
  cuatriDefault?: 1 | 2
  /** Refetch client-side desde DB después de guardar (editar y agregar) */
  onRefresh?: () => Promise<void>
}

const ESTADOS: { value: EstadoMateria; label: string }[] = [
  { value: 'cursando',        label: 'En curso' },
  { value: 'aprobada',        label: 'Aprobada' },
  { value: 'promocionada',    label: 'Promocionada' },
  { value: 'final_pendiente', label: 'Final pendiente' },
  { value: 'pendiente',       label: 'Pendiente (no cursada)' },
  { value: 'libre',           label: 'Libre' },
]

// ── helpers ───────────────────────────────────────────────────────────────────

function toStr(n: number | null | undefined): string {
  if (n === null || n === undefined) return ''
  return n.toString()
}

function toNum(s: string): number | null {
  const trimmed = s.trim()
  if (!trimmed) return null
  const n = parseFloat(trimmed)
  return isNaN(n) ? null : n
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function EditMateriaModal({
  open,
  onClose,
  materia,
  anioDefault = 1,
  cuatriDefault = 1,
  onRefresh,
}: EditMateriaModalProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // ── Estado controlado ──────────────────────────────────────────────────────
  const esEdicion = !!materia

  const [nombre,       setNombre]       = useState(materia?.nombre ?? '')
  const [anio,         setAnio]         = useState<number>(materia ? materia.anio : anioDefault)
  const [cuatrimestre, setCuatrimestre] = useState<1 | 2>(materia ? materia.cuatrimestre as 1 | 2 : cuatriDefault)
  const [estado,       setEstado]       = useState<EstadoMateria>(materia?.estado ?? 'cursando')

  const [p1,            setP1]            = useState(toStr(materia?.notas?.p1))
  const [p2,            setP2]            = useState(toStr(materia?.notas?.p2))
  const [recuperatorio, setRecuperatorio] = useState(toStr(materia?.notas?.recuperatorio))
  const [final_,        setFinal_]        = useState(toStr(materia?.notas?.final))
  const [cursada,       setCursada]       = useState(toStr(materia?.notas?.cursada))

  if (!open) return null

  function handleSave() {
    setErrorMsg(null)

    const notasInput = {
      p1:            toNum(p1),
      p2:            toNum(p2),
      recuperatorio: toNum(recuperatorio),
      cursada:       toNum(cursada),
      final:         toNum(final_),
    }

    startTransition(async () => {
      try {
        let result: { ok: boolean; error?: string }

        if (esEdicion && materia) {
          result = await guardarNotas(materia.id, estado, notasInput)
        } else {
          result = await agregarMateria({
            nombre,
            anio,
            cuatrimestre,
            estado,
            notas: notasInput,
          })
        }

        if (!result.ok) {
          setErrorMsg(result.error ?? 'Error al guardar.')
          return
        }

        // Refetch desde DB para mostrar datos frescos, luego cerrar modal
        await onRefresh?.()
        onClose()
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Error inesperado al guardar.')
      }
    })
  }

  // ── Input helpers ──────────────────────────────────────────────────────────

  const inputCls = 'rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
  const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-brand-400'

  function NotaField({
    id, label, value, onChange,
  }: {
    id: string
    label: string
    value: string
    onChange: (v: string) => void
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className={labelCls}>{label}</label>
        <input
          id={id}
          type="number"
          min="0"
          max="10"
          step="0.01"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          className={inputCls}
        />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !isPending) onClose() }}
    >
      <div className="w-[440px] rounded-2xl bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <h2 className="font-fraunces text-xl font-semibold text-brand-900">
          {esEdicion ? materia.nombre : 'Agregar materia'}
        </h2>
        <p className="mt-1 mb-6 text-sm text-brand-400">
          {esEdicion ? 'Cargá o actualizá las notas.' : 'Completá los datos de la materia.'}
        </p>

        {/* Nombre — solo al agregar */}
        {!esEdicion && (
          <div className="mb-4 flex flex-col gap-1.5">
            <label htmlFor="nm-nombre" className={labelCls}>Nombre</label>
            <input
              id="nm-nombre"
              type="text"
              required
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Genética Molecular"
              className="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        )}

        {/* Año y cuatrimestre — solo al agregar */}
        {!esEdicion && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nm-anio" className={labelCls}>Año</label>
              <select
                id="nm-anio"
                value={anio}
                onChange={e => setAnio(parseInt(e.target.value))}
                className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900 outline-none"
              >
                {[1,2,3,4,5].map(a => <option key={a} value={a}>{a}°</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nm-cuatri" className={labelCls}>Cuatrimestre</label>
              <select
                id="nm-cuatri"
                value={cuatrimestre}
                onChange={e => setCuatrimestre(parseInt(e.target.value) as 1 | 2)}
                className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900 outline-none"
              >
                <option value={1}>1°</option>
                <option value={2}>2°</option>
              </select>
            </div>
          </div>
        )}

        {/* Estado */}
        <div className="mb-5 flex flex-col gap-1.5">
          <label htmlFor="nm-estado" className={labelCls}>Estado</label>
          <select
            id="nm-estado"
            value={estado}
            onChange={e => setEstado(e.target.value as EstadoMateria)}
            className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900 outline-none transition focus:border-brand-500"
          >
            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>

        {/* Notas — grid 2×3 */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <NotaField id="nm-p1"     label="Parcial 1"      value={p1}            onChange={setP1} />
          <NotaField id="nm-p2"     label="Parcial 2"      value={p2}            onChange={setP2} />
          <NotaField id="nm-rec"    label="Recuperatorio"  value={recuperatorio} onChange={setRecuperatorio} />
          <NotaField id="nm-final"  label="Final"          value={final_}        onChange={setFinal_} />
          <NotaField id="nm-curs"   label="Nota cursada"   value={cursada}       onChange={setCursada} />
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-2.5">
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
            onClick={handleSave}
            disabled={isPending}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition hover:bg-brand-600 disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
