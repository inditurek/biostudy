import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Breadcrumb from '@/components/layout/Breadcrumb'
import SeparadoresGrid from '@/components/cuadernos/SeparadoresGrid'

interface Props {
  params: { id: string }
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

  const archivosCount: Record<string, number> = {}
  for (const s of (separadores ?? [])) {
    archivosCount[s.id] = (conteos ?? []).filter(a => a.separador_id === s.id).length
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

        <SeparadoresGrid
          cuaderno={cuaderno}
          separadores={separadores ?? []}
          archivosCount={archivosCount}
        />
      </div>
    </div>
  )
}
