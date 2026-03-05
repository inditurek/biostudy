'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { guardarArchivoMetadata } from '@/app/(app)/cuadernos/actions'

type Tab = 'archivo' | 'link'

interface Props {
  open: boolean
  onClose: () => void
  separadorId: string
  cuadernoId: string
  userId: string
}

export default function SubirArchivoModal({ open, onClose, separadorId, cuadernoId, userId }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('archivo')

  // — pestaña Archivo
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // — pestaña Link
  const [linkUrl, setLinkUrl] = useState('')
  const [linkNombre, setLinkNombre] = useState('')

  // — estado global
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function resetAndClose() {
    setFile(null)
    setLinkUrl('')
    setLinkNombre('')
    setError('')
    setUploading(false)
    setDragging(false)
    onClose()
  }

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragging(false), [])

  // ─── Submit archivo ───────────────────────────────────────────────────────────

  async function handleSubmitArchivo() {
    if (!file) return
    setError('')
    setUploading(true)

    try {
      const supabase = createClient()

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._\-\u00C0-\u024F]/g, '_')
      const path = `${userId}/${separadorId}/${Date.now()}-${sanitizedName}`

      const { error: uploadError } = await supabase.storage
        .from('archivos')
        .upload(path, file, { upsert: false })

      if (uploadError) throw new Error(`Error al subir: ${uploadError.message}`)

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const urlStorage = `${supabaseUrl}/storage/v1/object/public/archivos/${path}`

      const tipo = file.type.startsWith('image/') ? 'imagen' : 'pdf'

      await guardarArchivoMetadata(separadorId, file.name, tipo, urlStorage, file.size)

      router.refresh()
      resetAndClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setUploading(false)
    }
  }

  // ─── Submit link ──────────────────────────────────────────────────────────────

  async function handleSubmitLink() {
    const url = linkUrl.trim()
    const nombre = linkNombre.trim()
    if (!url || !nombre) {
      setError('Completá la URL y el nombre')
      return
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('La URL debe comenzar con http:// o https://')
      return
    }
    setError('')
    setUploading(true)

    try {
      await guardarArchivoMetadata(separadorId, nombre, 'link', url, 0)
      router.refresh()
      resetAndClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setUploading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4">
          <h2 className="font-fraunces text-lg font-semibold text-brand-900">Agregar archivo</h2>
          <button
            type="button"
            onClick={resetAndClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-400 transition hover:bg-brand-50 hover:text-brand-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-100">
          <button
            type="button"
            onClick={() => { setTab('archivo'); setError('') }}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              tab === 'archivo'
                ? 'border-b-2 border-brand-500 text-brand-600'
                : 'text-brand-400 hover:text-brand-600'
            }`}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => { setTab('link'); setError('') }}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              tab === 'link'
                ? 'border-b-2 border-brand-500 text-brand-600'
                : 'text-brand-400 hover:text-brand-600'
            }`}
          >
            Agregar link
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {tab === 'archivo' ? (
            <>
              {/* Dropzone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
                  dragging
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-brand-200 hover:border-brand-300 hover:bg-brand-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                />
                {file ? (
                  <div>
                    <p className="text-sm font-semibold text-brand-900 truncate">{file.name}</p>
                    <p className="mt-1 text-xs text-brand-400">
                      {(file.size / 1024).toFixed(0)} KB · Click para cambiar
                    </p>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto mb-3 h-8 w-8 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm font-semibold text-brand-700">Arrastrar o hacer click</p>
                    <p className="mt-1 text-xs text-brand-400">PDF o imagen</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-700">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-brand-200 px-3.5 py-2.5 text-sm text-brand-900 outline-none placeholder:text-brand-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-700">Nombre descriptivo</label>
                <input
                  type="text"
                  value={linkNombre}
                  onChange={(e) => setLinkNombre(e.target.value)}
                  placeholder="Ej: Video clase 3 — YouTube"
                  className="w-full rounded-xl border border-brand-200 px-3.5 py-2.5 text-sm text-brand-900 outline-none placeholder:text-brand-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 border-t border-brand-100 px-6 py-4">
          <button
            type="button"
            onClick={resetAndClose}
            disabled={uploading}
            className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={tab === 'archivo' ? handleSubmitArchivo : handleSubmitLink}
            disabled={uploading || (tab === 'archivo' ? !file : !linkUrl.trim() || !linkNombre.trim())}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(124,58,237,0.3)] transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {uploading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Subiendo...
              </>
            ) : (
              tab === 'archivo' ? 'Subir archivo' : 'Agregar link'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
