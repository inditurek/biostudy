import { createClient } from '@/lib/supabase/server'
import CuadernosGrid from '@/components/cuadernos/CuadernosGrid'

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

  const separadoresCounts: Record<string, number> = {}
  for (const c of (cuadernos ?? [])) {
    separadoresCounts[c.id] = (conteos ?? []).filter(s => s.cuaderno_id === c.id).length
  }

  return (
    <div className="p-10">
      {/* Gradiente de fondo */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(124,58,237,0.12)_0%,transparent_60%),radial-gradient(ellipse_60%_50%_at_90%_110%,rgba(168,85,247,0.1)_0%,transparent_55%)]" />

      <div className="relative z-10">
        <CuadernosGrid
          cuadernos={cuadernos ?? []}
          separadoresCounts={separadoresCounts}
        />
      </div>
    </div>
  )
}
