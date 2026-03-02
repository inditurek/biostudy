import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Breadcrumb from '@/components/layout/Breadcrumb'
import SeparadorCard from '@/components/cuadernos/SeparadorCard'
import NuevoSeparadorBtn from '@/components/cuadernos/SeparadoresClient'

interface Props {
  params: { id: string }
}

// Función para generar un gradiente a partir del color del cuaderno
function gradienteMini(color: string): string {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const f = 0.6
  const dark = `#${Math.round(r * f).toString(16).padStart(2, '0')}${Math.round(g * f).toString(16).padStart(2, '0')}${Math.round(b * f).toString(16).padStart(2, '0')}`
  return `linear-gradient(160deg, ${dark}, ${color})`
}

export default async function CuadernoDetallePage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Verificar que el cuaderno pertenece al usuario
  const { data: cuaderno } = await supabase
    .from('cuadernos')
    .select('*')
    .eq('id', params.id)
    .eq('usuario_id', user!.id)
    .single()

  if (!cuaderno) notFound()

  // Separadores del cuaderno
  const { data: separadores } = await supabase
    .from('separadores')
    .select('*')
    .eq('cuaderno_id', cuaderno.id)
    .order('orden', { ascending: true })

  // Conteo de archivos por separador
  const { data: conteos } = await supabase
    .from('archivos')
    .select('separador_id')
    .in('separador_id', (separadores ?? []).map((s) => s.id))

  function contarArchivos(separadorId: string): number {
    return (conteos ?? []).filter((a) => a.separador_id === separadorId).length
  }

  return (
    <div className="p-10">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(124,58,237,0.12)_0%,transparent_60%)]" />

      <div className="relative z-10">
        <Breadcrumb
          items={[
            { label: 'Cuadernos', href: '/cuadernos' },
            { label: cuaderno.nombre },
          ]}
        />

        {/* Header del cuaderno */}
        <div className="mb-8 flex items-center gap-5">
          {/* Portada mini */}
          <div
            className="relative h-[72px] w-14 flex-shrink-0 rounded-sm rounded-r-xl shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
            style={{ background: gradienteMini(cuaderno.color) }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-sm bg-black/15" />
          </div>
          <div>
            <h1 className="font-fraunces text-[28px] font-semibold text-brand-900">
              {cuaderno.nombre}
            </h1>
            <p className="mt-1 text-sm text-brand-400">
              {(separadores ?? []).length === 0
                ? 'Sin separadores'
                : `${(separadores ?? []).length} separador${(separadores ?? []).length !== 1 ? 'es' : ''}`}
            </p>
          </div>
        </div>

        {/* Separadores */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-fraunces text-lg font-semibold text-brand-900">
            Separadores
          </h2>
          <NuevoSeparadorBtn cuadernoId={cuaderno.id} />
        </div>

        {(separadores ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
              <svg className="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-fraunces text-base font-semibold text-brand-900">Sin separadores</p>
            <p className="mt-1 text-sm text-brand-400">Creá un separador para organizar el contenido del cuaderno</p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {(separadores ?? []).map((sep) => (
              <SeparadorCard
                key={sep.id}
                separador={sep}
                cuadernoId={cuaderno.id}
                archivosCount={contarArchivos(sep.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
