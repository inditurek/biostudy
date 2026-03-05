import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TemporizadorClient from '@/components/temporizador/TemporizadorClient'
import { cargarStatsFoco } from './actions'
import type { Materia } from '@/lib/supabase/types'

export default async function TemporizadorPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: rawMaterias }, statsIniciales] = await Promise.all([
    supabase
      .from('materias')
      .select('id, nombre, estado')
      .eq('usuario_id', user.id)
      .in('estado', ['cursando', 'final_pendiente'])
      .order('nombre'),
    cargarStatsFoco(),
  ])

  const materias = (rawMaterias ?? []) as Pick<Materia, 'id' | 'nombre' | 'estado'>[]

  return (
    <div className="min-h-screen bg-brand-50 px-6 py-8 md:px-10">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(124,58,237,0.10)_0%,transparent_60%)]" />
      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="font-fraunces text-[28px] font-bold text-brand-900">
            Temporizador de Foco ⏱️
          </h1>
          <p className="mt-1 text-sm text-brand-400">
            Estudiá con intervalos estructurados y seguí tu progreso.
          </p>
        </div>
        <TemporizadorClient
          materias={materias}
          statsIniciales={statsIniciales}
        />
      </div>
    </div>
  )
}
