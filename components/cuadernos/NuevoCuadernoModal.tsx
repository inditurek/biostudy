'use client'

import { useRef, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import type { Cuaderno } from '@/lib/supabase/types'
import { crearCuaderno, editarCuaderno } from '@/app/(app)/cuadernos/actions'

const COLORES = [
  '#7c3aed', // violeta (default)
  '#5b2d9e', // violeta oscuro
  '#0d9488', // teal
  '#d97706', // ámbar
  '#be123c', // rosa
  '#3730a3', // índigo
  '#065f46', // verde
  '#1d4ed8', // azul
]

interface NuevoCuadernoModalProps {
  open: boolean
  onClose: () => void
  cuaderno?: Cuaderno  // si viene → modo edición
}

export default function NuevoCuadernoModal({ open, onClose, cuaderno }: NuevoCuadernoModalProps) {
  const [color, setColor] = useState(cuaderno?.color ?? '#7c3aed')
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const editMode = !!cuaderno

  if (!open) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('color', color)

    startTransition(async () => {
      if (editMode && cuaderno) {
        await editarCuaderno(cuaderno.id, formData)
      } else {
        await crearCuaderno(formData)
      }
      onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-[380px] rounded-2xl bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">

        {/* Título */}
        <h2 className="font-fraunces text-xl font-semibold text-brand-900">
          {editMode ? 'Editar cuaderno' : 'Nuevo cuaderno'}
        </h2>
        <p className="mt-1 text-sm text-brand-400">
          {editMode ? 'Cambiá el nombre o el color' : 'Dale un nombre y elegí un color'}
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-5">
          {/* Input nombre */}
          <input
            name="nombre"
            type="text"
            placeholder="Ej: Genética Molecular"
            defaultValue={cuaderno?.nombre ?? ''}
            required
            disabled={isPending}
            className="mb-5 w-full rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900 placeholder-brand-300 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
          />

          {/* Selector de color */}
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-brand-400">
            Color
          </p>
          <div className="mb-6 grid grid-cols-8 gap-2.5">
            {COLORES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'h-9 w-9 rounded-xl border-[3px] transition-all hover:scale-110',
                  color === c ? 'border-brand-900 scale-110' : 'border-transparent'
                )}
                style={{ background: c }}
              />
            ))}
          </div>

          {/* Acciones */}
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
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition hover:bg-brand-600 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : editMode ? 'Guardar cambios' : 'Crear cuaderno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
