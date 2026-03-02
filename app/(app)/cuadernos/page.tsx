import { createClient } from '@/lib/supabase/server'
import NotebookCard from '@/components/cuadernos/NotebookCard'
import NuevoCuadernoBtn from '@/components/cuadernos/CuadernosClient'

export default async function CuadernosPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Cuadernos del usuario ordenados
  const { data: cuadernos } = await supabase
    .from('cuadernos')
    .select('*')
    .eq('usuario_id', user!.id)
    .order('orden', { ascending: true })

  // Conteo de separadores por cuaderno
  const { data: conteos } = await supabase
    .from('separadores')
    .select('cuaderno_id')
    .in('cuaderno_id', (cuadernos ?? []).map((c) => c.id))

  function contarSeparadores(cuadernoId: string): number {
    return (conteos ?? []).filter((s) => s.cuaderno_id === cuadernoId).length
  }

  return (
    <div className="p-10">
      {/* Gradiente de fondo */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(124,58,237,0.12)_0%,transparent_60%),radial-gradient(ellipse_60%_50%_at_90%_110%,rgba(168,85,247,0.1)_0%,transparent_55%)]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-fraunces text-[32px] font-semibold leading-tight text-brand-900">
              Mis Cuadernos
            </h1>
            <p className="mt-1 text-sm text-brand-400">
              {(cuadernos ?? []).length === 0
                ? 'Todavía no tenés cuadernos'
                : `${(cuadernos ?? []).length} cuaderno${(cuadernos ?? []).length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <NuevoCuadernoBtn />
        </div>

        {/* Grid o estado vacío */}
        {(cuadernos ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <svg className="h-8 w-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="font-fraunces text-lg font-semibold text-brand-900">Todavía no tenés cuadernos</p>
            <p className="mt-1 text-sm text-brand-400">Creá tu primer cuaderno para organizar tus materias</p>
          </div>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {(cuadernos ?? []).map((cuaderno) => (
              <NotebookCard
                key={cuaderno.id}
                cuaderno={cuaderno}
                separadoresCount={contarSeparadores(cuaderno.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
