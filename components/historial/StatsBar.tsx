import type { HistorialStats } from './types'

interface StatsBarProps {
  stats: HistorialStats
}

function fmt(n: number | null): string {
  if (n === null) return '—'
  return n % 1 === 0 ? n.toString() : n.toFixed(1)
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="mb-8 grid grid-cols-5 gap-3.5">
      {/* Promedio — destacado */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Promedio</p>
        <p className="mt-1.5 font-fraunces text-[28px] font-bold leading-none text-white">
          {fmt(stats.promedioGeneral)}
        </p>
        <p className="mt-1 text-[11px] text-white/60">Sobre aprobadas</p>
      </div>

      {/* Aprobadas */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-300">Aprobadas</p>
        <p className="mt-1.5 font-fraunces text-[28px] font-bold leading-none text-green-600">
          {stats.aprobadas}
        </p>
        <p className="mt-1 text-[11px] text-brand-300">de {stats.total} totales</p>
      </div>

      {/* En curso */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-300">En curso</p>
        <p className="mt-1.5 font-fraunces text-[28px] font-bold leading-none text-blue-600">
          {stats.enCurso}
        </p>
        <p className="mt-1 text-[11px] text-brand-300">Este cuatrimestre</p>
      </div>

      {/* Promocionadas */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-300">Promovidas</p>
        <p className="mt-1.5 font-fraunces text-[28px] font-bold leading-none text-purple-700">
          {stats.promocionadas}
        </p>
        <p className="mt-1 text-[11px] text-brand-300">Sin final</p>
      </div>

      {/* Recuperatorios */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-300">Recuperatorios</p>
        <p className="mt-1.5 font-fraunces text-[28px] font-bold leading-none text-amber-600">
          {stats.recuperatorios}
        </p>
        <p className="mt-1 text-[11px] text-brand-300">Realizados</p>
      </div>
    </div>
  )
}
