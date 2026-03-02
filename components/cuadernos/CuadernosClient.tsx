'use client'

import { useState } from 'react'
import NuevoCuadernoModal from './NuevoCuadernoModal'

export default function NuevoCuadernoBtn() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(124,58,237,0.35)] transition hover:-translate-y-px hover:bg-brand-600"
      >
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo cuaderno
      </button>

      <NuevoCuadernoModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
