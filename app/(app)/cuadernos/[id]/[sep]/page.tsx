import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Breadcrumb from '@/components/layout/Breadcrumb'

interface Props {
  params: { id: string; sep: string }
}

const TIPO_ICON: Record<string, { color: string; svg: React.ReactNode }> = {
  pdf: {
    color: '#7c3aed',
    svg: (
      <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  imagen: {
    color: '#d97706',
    svg: (
      <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  link: {
    color: '#0d9488',
    svg: (
      <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  nota: {
    color: '#3730a3',
    svg: (
      <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-fraunces text-base font-semibold text-brand-900">Archivos</h2>
          <button
            disabled
            title="Próximamente"
            className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-4 py-2 text-[13px] font-semibold text-brand-400 opacity-60 cursor-not-allowed"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar archivo
          </button>
        </div>

        {(archivos ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 py-14 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
              <svg className="h-6 w-6 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-fraunces text-base font-semibold text-brand-900">Sin archivos</p>
            <p className="mt-1 text-sm text-brand-400">La subida de archivos estará disponible próximamente</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {(archivos ?? []).map((archivo) => {
              const tipo = TIPO_ICON[archivo.tipo] ?? TIPO_ICON.nota
              return (
                <div
                  key={archivo.id}
                  className="flex items-center gap-3.5 rounded-xl border border-brand-100 bg-white px-3.5 py-3 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: tipo.color }}
                  >
                    {tipo.svg}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-900">{archivo.nombre}</p>
                    <p className="mt-0.5 text-[11px] text-brand-300">
                      {archivo.tipo.toUpperCase()} · {formatBytes(archivo.tamano)}
                    </p>
                  </div>
                  <a
                    href={archivo.url_storage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-brand-600"
                  >
                    Abrir
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {/* Guía de Estudio — placeholder */}
        <div className="mt-10 border-t border-brand-100 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-fraunces text-base font-semibold text-brand-900">Guía de Estudio</h2>
              <p className="mt-0.5 text-sm text-brand-400">Tu plan de estudio personalizado para este separador</p>
            </div>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-500">
              Próximamente
            </span>
          </div>
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-brand-200 py-10">
            <p className="text-sm text-brand-300">La Guía de Estudio se activa en la siguiente fase</p>
          </div>
        </div>
      </div>
    </div>
  )
}
