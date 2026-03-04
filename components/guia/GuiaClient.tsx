'use client'

import { useState, useTransition } from 'react'
import type { ModoGuia, DuracionSprint } from '@/lib/supabase/types'
import { PLANES } from '@/lib/guia/planes'
import { getPlanKey } from '@/lib/guia/tipos'
import {
  inicializarProgreso,
  togglePasoCompletado,
  cambiarModo,
  reiniciarProgreso,
  type ProgresoGuiaRow,
} from '@/app/(app)/cuadernos/guia/actions'
import ModeSelector from './ModeSelector'
import SprintDurationPicker from './SprintDurationPicker'
import BloqueCard from './BloqueCard'
import ProgressPanel from './ProgressPanel'

interface Props {
  separadorId: string
  initialProgreso: ProgresoGuiaRow | null
}

export default function GuiaClient({ separadorId, initialProgreso }: Props) {
  const [modo, setModo] = useState<ModoGuia>(initialProgreso?.modo ?? 'cursada')
  const [duracion, setDuracion] = useState<DuracionSprint>(
    (initialProgreso?.duracion_sprint as DuracionSprint) ?? 7
  )
  const [completados, setCompletados] = useState<Set<string>>(
    new Set(initialProgreso?.pasos_completados ?? [])
  )
  const [isPending, startTransition] = useTransition()

  const planKey = getPlanKey(modo, modo === 'sprint' ? duracion : null)
  const plan = PLANES[planKey]

  function handleModeChange(newModo: ModoGuia) {
    if (newModo === modo) return
    setModo(newModo)
    setCompletados(new Set())
    startTransition(async () => {
      if (!initialProgreso) {
        await inicializarProgreso(separadorId, newModo, newModo === 'sprint' ? duracion : null)
      } else {
        await cambiarModo(separadorId, newModo, newModo === 'sprint' ? duracion : null)
      }
    })
  }

  function handleDuracionChange(d: DuracionSprint) {
    if (d === duracion) return
    setDuracion(d)
    setCompletados(new Set())
    startTransition(async () => {
      await cambiarModo(separadorId, 'sprint', d)
    })
  }

  function handleTogglePaso(pasoId: string, newValue: boolean) {
    setCompletados(prev => {
      const next = new Set(prev)
      newValue ? next.add(pasoId) : next.delete(pasoId)
      return next
    })
    startTransition(async () => {
      const result = await togglePasoCompletado(separadorId, pasoId, newValue)
      if (!result.ok) {
        // Rollback on failure
        setCompletados(prev => {
          const next = new Set(prev)
          newValue ? next.delete(pasoId) : next.add(pasoId)
          return next
        })
      }
    })
  }

  function handleReset() {
    if (!window.confirm('¿Reiniciar el progreso de este modo?')) return
    setCompletados(new Set())
    startTransition(async () => {
      await reiniciarProgreso(separadorId)
    })
  }

  return (
    <div className={isPending ? 'opacity-75 transition-opacity' : 'transition-opacity'}>
      {/* Mode selector */}
      <ModeSelector modoActual={modo} onSelect={handleModeChange} />

      {/* Sprint duration picker */}
      {modo === 'sprint' && (
        <div className="mt-6">
          <SprintDurationPicker duracionActual={duracion} onSelect={handleDuracionChange} />
        </div>
      )}

      {/* Plan layout: bloques + right panel */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        {/* Bloques */}
        <div className="flex flex-col gap-3.5">
          {plan.bloques.map((bloque, i) => (
            <BloqueCard
              key={bloque.id}
              bloque={bloque}
              index={i}
              pasosCompletados={completados}
              onTogglePaso={handleTogglePaso}
            />
          ))}
        </div>

        {/* Right panel */}
        <ProgressPanel
          plan={plan}
          modo={modo}
          duracion={modo === 'sprint' ? duracion : null}
          completados={completados}
          onReset={handleReset}
        />
      </div>
    </div>
  )
}
