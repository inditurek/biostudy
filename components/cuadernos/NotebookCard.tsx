'use client'

import Link from 'next/link'
import type { Cuaderno } from '@/lib/supabase/types'

interface NotebookCardProps {
  cuaderno: Cuaderno
  separadoresCount: number
}

// Genera un gradiente oscuro→claro a partir del color del cuaderno
function gradiente(color: string): string {
  // Versión más oscura: mezclamos negro al 40% → aproximamos oscureciendo el hex
  const dark = oscurecer(color)
  return `linear-gradient(160deg, ${dark}, ${color})`
}

function oscurecer(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const factor = 0.6
  const rd = Math.round(r * factor).toString(16).padStart(2, '0')
  const gd = Math.round(g * factor).toString(16).padStart(2, '0')
  const bd = Math.round(b * factor).toString(16).padStart(2, '0')
  return `#${rd}${gd}${bd}`
}

export default function NotebookCard({ cuaderno, separadoresCount }: NotebookCardProps) {
  return (
    <Link
      href={`/cuadernos/${cuaderno.id}`}
      className="group block cursor-pointer"
    >
      {/* Libro */}
      <div
        className="relative flex h-[220px] flex-col justify-end overflow-hidden rounded-sm rounded-r-xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:-rotate-1 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
        style={{ background: gradiente(cuaderno.color) }}
      >
        {/* Lomo */}
        <div className="absolute left-0 top-0 bottom-0 w-3 rounded-l-sm bg-black/15" />

        {/* Círculo decorativo */}
        <div className="absolute right-4 top-5 h-10 w-10 rounded-full border-2 border-white/20" />

        {/* Líneas decorativas */}
        <div className="absolute left-7 top-6 flex flex-col gap-2 opacity-15">
          <div className="h-0.5 w-20 rounded-sm bg-white" />
          <div className="h-0.5 w-14 rounded-sm bg-white" />
          <div className="h-0.5 w-10 rounded-sm bg-white" />
        </div>

        {/* Badge estado */}
        <span className="absolute right-3 top-3 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          En curso
        </span>

        {/* Ícono */}
        <div className="relative z-10 mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>

        {/* Nombre */}
        <p className="relative z-10 font-fraunces text-[15px] font-semibold leading-tight text-white">
          {cuaderno.nombre}
        </p>

        {/* Meta */}
        <p className="relative z-10 mt-1 text-[11px] font-normal text-white/70">
          {separadoresCount === 0
            ? 'Sin separadores'
            : `${separadoresCount} separador${separadoresCount !== 1 ? 'es' : ''}`}
        </p>
      </div>
    </Link>
  )
}
