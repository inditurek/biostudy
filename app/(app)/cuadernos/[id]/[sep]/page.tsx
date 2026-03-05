import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Breadcrumb from '@/components/layout/Breadcrumb'
import GuiaClient from '@/components/guia/GuiaClient'
import ArchivosSection from '@/components/cuadernos/ArchivosSection'
import type { ProgresoGuiaRow } from '@/app/(app)/cuadernos/guia/actions'
import type { Archivo } from '@/lib/supabase/types'

interface Props {
  params: { id: string; sep: string }
}

export default async function SeparadorDetallePage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Separador + cuaderno padre (para verificar pertenencia)
  const { data: separador } = await supabase
    .from('separadores')
    .select('*, cuadernos!inner(id, nombre, usuario_id)')
    .eq('id', params.sep)
    .eq('cuadernos.usuario_id', user!.id)
    .single()

  if (!separador) notFound()

  const cuaderno = (separador as { cuadernos: { id: string; nombre: string; usuario_id: string } }).cuadernos

  // Archivos del separador
  const { data: archivos } = await supabase
    .from('archivos')
    .select('*')
    .eq('separador_id', separador.id)
    .order('creado_en', { ascending: false })

  // Progreso de la guía de estudio para este separador
  const { data: progresoGuia } = await supabase
    .from('progreso_guia')
    .select('*')
    .eq('separador_id', separador.id)
    .maybeSingle()

  return (
    <div className="p-10">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(124,58,237,0.12)_0%,transparent_60%)]" />

      <div className="relative z-10">
        <Breadcrumb
          items={[
            { label: 'Cuadernos', href: '/cuadernos' },
            { label: cuaderno.nombre, href: `/cuadernos/${cuaderno.id}` },
            { label: separador.nombre },
          ]}
        />

        {/* Header del separador */}
        <div className="mb-8 flex items-center gap-4">
          <div
            className="h-[52px] w-1.5 flex-shrink-0 rounded-full"
            style={{ background: separador.color }}
          />
          <div>
            <h1 className="font-fraunces text-[26px] font-semibold text-brand-900">
              {separador.nombre}
            </h1>
            <p className="mt-0.5 text-sm text-brand-400">
              {cuaderno.nombre} · {(archivos ?? []).length} archivo{(archivos ?? []).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Archivos */}
        <ArchivosSection
          archivos={(archivos ?? []) as Archivo[]}
          separadorId={separador.id}
          cuadernoId={cuaderno.id}
          userId={user!.id}
        />

        {/* Guía de Estudio */}
        <div className="mt-10 border-t border-brand-100 pt-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-fraunces text-base font-semibold text-brand-900">Guía de Estudio</h2>
              <p className="mt-0.5 text-sm text-brand-400">Tu plan de estudio personalizado para este separador</p>
            </div>
          </div>
          <GuiaClient
            separadorId={separador.id}
            initialProgreso={(progresoGuia as ProgresoGuiaRow) ?? null}
          />
        </div>
      </div>
    </div>
  )
}
