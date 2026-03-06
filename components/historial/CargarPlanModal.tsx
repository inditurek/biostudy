'use client'

import { useState } from 'react'
import { cargarPlanPersonalizado } from '@/app/(app)/historial/actions'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  onRefresh: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CargarPlanModal({ open, onClose, onRefresh }: Props) {
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; importadas?: number; error?: string } | null>(null)

  if (!open) return null

  async function handleSubir() {
    if (!texto.trim()) return
    setCargando(true)
    setResultado(null)
    const res = await cargarPlanPersonalizado(texto)
    setResultado(res)
    setCargando(false)
    if (res.ok) {
      onRefresh()
      setTimeout(onClose, 1800)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-brand-100 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

        <h2 className="font-fraunces text-lg font-bold text-brand-900">Subir plan de materias</h2>
        <p className="mt-1 text-sm text-brand-400">
          Una materia por línea, con el formato:{' '}
          <code className="rounded bg-brand-50 px-1.5 py-0.5 font-mono text-xs text-brand-700">
            Nombre;Año;Cuatrimestre;Estado
          </code>
        </p>
        <p className="mt-0.5 text-xs text-brand-300">
          El estado es opcional (queda como <em>pendiente</em> si no lo ponés).
          Valores válidos: pendiente, cursando, aprobada, promocionada, final_pendiente, libre.
        </p>

        {/* Ejemplo */}
        <div className="mt-3 rounded-xl bg-brand-50 px-4 py-3 font-mono text-xs leading-relaxed text-brand-600">
          <p className="text-brand-300"># Podés usar # para comentarios</p>
          <p>Cálculo I;1;1;aprobada</p>
          <p>Química General;1;1;aprobada</p>
          <p>Física Aplicada;1;2;cursando</p>
          <p>Genética Molecular;2;1</p>
        </div>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={'Cálculo I;1;1;aprobada\nQuímica;1;2;pendiente'}
          rows={10}
          className="mt-4 w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 font-mono text-xs text-brand-900 outline-none placeholder:text-brand-300 focus:border-brand-400 focus:bg-white"
        />

        {resultado && (
          <div className={`mt-2 rounded-xl px-4 py-2.5 text-sm font-medium ${resultado.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {resultado.ok
              ? `✓ ${resultado.importadas} materia${resultado.importadas !== 1 ? 's' : ''} importada${resultado.importadas !== 1 ? 's' : ''} correctamente`
              : resultado.error}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-200 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubir}
            disabled={cargando || !texto.trim()}
            className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition hover:-translate-y-px hover:bg-brand-600 disabled:opacity-50"
          >
            {cargando ? 'Importando…' : 'Subir plan'}
          </button>
        </div>
      </div>
    </div>
  )
}
