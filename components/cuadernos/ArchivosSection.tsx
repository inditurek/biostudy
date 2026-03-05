'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Archivo } from '@/lib/supabase/types'
import { eliminarArchivo } from '@/app/(app)/cuadernos/actions'
import SubirArchivoModal from './SubirArchivoModal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  if (!bytes || bytes === 0) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatFecha(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  archivos: Archivo[]
  separadorId: string
  cuadernoId: string
  userId: string
}

export default function ArchivosSection({ archivos, separadorId, cuadernoId, userId }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete(archivo: Archivo) {
    if (!confirm(`¿Eliminar "${archivo.nombre}"?`)) return
    startTransition(async () => {
      await eliminarArchivo(archivo.id, archivo.url_storage, separadorId, cuadernoId)
      router.refresh()
    })
  }

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-fraunces text-base font-semibold text-brand-900">Archivos</h2>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_3px_10px_rgba(124,58,237,0.3)] transition hover:-translate-y-px hover:bg-brand-600"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M12 4v16m8-8H4" />
          </svg>
          Agregar archivo
        </button>
      </div>

      {/* Lista o vacío */}
      {archivos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 py-14 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
            <svg className="h-6 w-6 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-fraunces text-base font-semibold text-brand-900">Sin archivos</p>
          <p className="mt-1 text-sm text-brand-400">Subí un PDF, una imagen o pegá un link</p>
        </div>
      ) : (
        <div className={`flex flex-col gap-2.5 transition-opacity${isPending ? ' opacity-60' : ''}`}>
          {archivos.map((archivo) => {
            const tipo = TIPO_ICON[archivo.tipo] ?? TIPO_ICON.pdf
            const esLink = archivo.tipo === 'link'

            return (
              <div
                key={archivo.id}
                className="group flex items-center gap-3.5 rounded-xl border border-brand-100 bg-white px-3.5 py-3 transition hover:border-brand-200 hover:bg-brand-50"
              >
                {/* Ícono */}
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: tipo.color }}
                >
                  {tipo.svg}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-900">{archivo.nombre}</p>
                  <p className="mt-0.5 text-[11px] text-brand-300">
                    {archivo.tipo.toUpperCase()}
                    {!esLink && ` · ${formatBytes(archivo.tamano)}`}
                    {' · '}
                    {formatFecha(archivo.creado_en)}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!esLink && (
                    <a
                      href={archivo.url_storage}
                      download
                      className="rounded-lg border border-brand-200 px-3 py-1.5 text-[11px] font-semibold text-brand-600 transition hover:bg-brand-50"
                    >
                      Descargar
                    </a>
                  )}
                  <a
                    href={archivo.url_storage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-brand-600"
                  >
                    Abrir
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(archivo)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                    title="Eliminar"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <SubirArchivoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        separadorId={separadorId}
        cuadernoId={cuadernoId}
        userId={userId}
      />
    </>
  )
}
