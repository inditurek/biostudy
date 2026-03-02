'use client'

import { useState } from 'react'
import NuevoSeparadorModal from './NuevoSeparadorModal'

interface Props {
  cuadernoId: string
}

export default function NuevoSeparadorBtn({ cuadernoId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_3px_10px_rgba(124,58,237,0.3)] transition hover:-translate-y-px hover:bg-brand-600"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo separador
      </button>

      <NuevoSeparadorModal
        open={open}
        onClose={() => setOpen(false)}
        cuadernoId={cuadernoId}
      />
    </>
  )
}
