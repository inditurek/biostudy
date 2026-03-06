'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { actualizarPerfil, eliminarCuenta, cerrarSesion } from '@/app/(app)/ajustes/actions'
import type { Perfil } from '@/app/(app)/ajustes/page'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  perfil: Perfil | null
  email: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AjustesClient({ perfil, email }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // ── Estado perfil ────────────────────────────────────────────────────────────
  const [perfilMsg, setPerfilMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // ── Dark mode ────────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'))
  }, [])

  function handleToggleDark(enabled: boolean) {
    setDarkMode(enabled)
    if (enabled) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // ── Guardar perfil ───────────────────────────────────────────────────────────
  async function handleGuardarPerfil(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPerfilMsg(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const res = await actualizarPerfil(fd)
      setPerfilMsg(
        res.ok
          ? { ok: true, text: 'Cambios guardados.' }
          : { ok: false, text: res.error ?? 'Error al guardar.' }
      )
      if (res.ok) router.refresh()
    })
  }

  // ── Cerrar sesión ────────────────────────────────────────────────────────────
  function handleCerrarSesion() {
    startTransition(async () => {
      await cerrarSesion()
    })
  }

  // ── Eliminar cuenta ──────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deletePending, setDeletePending] = useState(false)

  async function handleEliminarCuenta() {
    if (confirmText !== 'ELIMINAR') {
      setDeleteError('Escribí ELIMINAR para confirmar.')
      return
    }
    setDeleteError('')
    setDeletePending(true)
    const res = await eliminarCuenta()
    if (res.ok) {
      router.push('/login')
    } else {
      setDeleteError(res.error ?? 'Error al eliminar la cuenta.')
      setDeletePending(false)
    }
  }

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex max-w-2xl flex-col gap-6">

        {/* ── Título ────────────────────────────────────────────────────────── */}
        <div>
          <h1 className="font-fraunces text-2xl font-bold text-brand-900">Ajustes</h1>
          <p className="mt-1 text-sm text-brand-400">{email}</p>
        </div>

        {/* ── Sección 1: Mi perfil ──────────────────────────────────────────── */}
        <section className="rounded-2xl border border-brand-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="border-b border-brand-100 px-6 py-4">
            <h2 className="font-fraunces text-base font-semibold text-brand-900">Mi perfil</h2>
          </div>

          <form onSubmit={handleGuardarPerfil} className="flex flex-col gap-4 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-600" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                defaultValue={perfil?.nombre ?? ''}
                placeholder="Tu nombre"
                className="rounded-xl border border-brand-200 px-3 py-2.5 text-sm text-brand-900 outline-none focus:border-brand-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-600" htmlFor="carrera">
                Carrera
              </label>
              <input
                id="carrera"
                name="carrera"
                type="text"
                defaultValue={perfil?.carrera ?? ''}
                placeholder="Ej: Ingeniería en Sistemas"
                className="rounded-xl border border-brand-200 px-3 py-2.5 text-sm text-brand-900 outline-none focus:border-brand-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-600" htmlFor="universidad">
                Universidad
              </label>
              <input
                id="universidad"
                name="universidad"
                type="text"
                defaultValue={perfil?.universidad ?? ''}
                placeholder="Ej: UBA"
                className="rounded-xl border border-brand-200 px-3 py-2.5 text-sm text-brand-900 outline-none focus:border-brand-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition hover:-translate-y-px hover:bg-brand-600 disabled:opacity-50"
              >
                {isPending ? 'Guardando…' : 'Guardar cambios'}
              </button>
              {perfilMsg && (
                <p className={`text-sm font-medium ${perfilMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
                  {perfilMsg.text}
                </p>
              )}
            </div>
          </form>
        </section>

        {/* ── Sección 2: Apariencia ─────────────────────────────────────────── */}
        <section className="rounded-2xl border border-brand-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="border-b border-brand-100 px-6 py-4">
            <h2 className="font-fraunces text-base font-semibold text-brand-900">Apariencia</h2>
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-semibold text-brand-800">Modo oscuro</p>
              <p className="mt-0.5 text-xs text-brand-400">Cambia el tema de la aplicación</p>
            </div>

            {/* Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={() => handleToggleDark(!darkMode)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                darkMode ? 'bg-brand-500' : 'bg-brand-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* ── Sección 3: Zona de peligro ────────────────────────────────────── */}
        <section className="rounded-2xl border border-red-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="border-b border-red-100 px-6 py-4">
            <h2 className="font-fraunces text-base font-semibold text-red-700">Zona de peligro</h2>
          </div>

          <div className="flex flex-col gap-3 px-6 py-5">
            {/* Cerrar sesión */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-800">Cerrar sesión</p>
                <p className="mt-0.5 text-xs text-brand-400">Salís de tu cuenta en este dispositivo</p>
              </div>
              <button
                type="button"
                onClick={handleCerrarSesion}
                disabled={isPending}
                className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
              >
                Cerrar sesión
              </button>
            </div>

            <div className="h-px bg-red-50" />

            {/* Eliminar cuenta */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700">Eliminar cuenta</p>
                <p className="mt-0.5 text-xs text-brand-400">Borra todos tus datos de forma permanente</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowDeleteModal(true); setConfirmText(''); setDeleteError('') }}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Modal eliminar cuenta ──────────────────────────────────────────────── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false) }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="font-fraunces text-lg font-bold text-brand-900">¿Eliminar tu cuenta?</h3>
            <p className="mt-1 text-sm text-brand-400">
              Esta acción es <strong className="text-brand-700">permanente e irreversible</strong>. Se borrarán todas tus materias, cuadernos, historial y sesiones.
            </p>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-600">
                Escribí <span className="font-black text-red-600">ELIMINAR</span> para confirmar
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-700 outline-none focus:border-red-400 placeholder:text-red-200"
              />
              {deleteError && (
                <p className="text-xs text-red-500">{deleteError}</p>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-brand-200 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminarCuenta}
                disabled={deletePending || confirmText !== 'ELIMINAR'}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-40"
              >
                {deletePending ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
