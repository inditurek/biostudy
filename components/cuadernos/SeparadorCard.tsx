import Link from 'next/link'
import type { Separador } from '@/lib/supabase/types'

interface SeparadorCardProps {
  separador: Separador
  cuadernoId: string
  archivosCount: number
}

export default function SeparadorCard({ separador, cuadernoId, archivosCount }: SeparadorCardProps) {
  return (
    <Link
      href={`/cuadernos/${cuadernoId}/${separador.id}`}
      className="group block rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_10px_24px_rgba(91,45,158,0.12)]"
    >
      {/* Tab de color */}
      <div
        className="mb-3 h-1 w-10 rounded-full"
        style={{ background: separador.color }}
      />

      {/* Nombre */}
      <p className="text-sm font-semibold text-brand-900 leading-snug">
        {separador.nombre}
      </p>

      {/* Meta */}
      <p className="mt-2 text-xs text-brand-300">
        {archivosCount === 0
          ? 'Sin archivos'
          : `${archivosCount} archivo${archivosCount !== 1 ? 's' : ''}`}
      </p>
    </Link>
  )
}
