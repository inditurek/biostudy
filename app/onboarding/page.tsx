'use client'

import { useState } from 'react'
import { completarOnboarding } from './actions'

export default function OnboardingPage() {
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    const formData = new FormData(e.currentTarget)
    await completarOnboarding(formData)
    // completarOnboarding hace redirect, así que este código no llega a ejecutarse
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-brand-200">

          {/* Encabezado */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
              <span className="font-fraunces text-xl font-bold text-white">ML</span>
            </div>
            <h1 className="font-fraunces text-2xl font-semibold text-brand-900">
              Contanos sobre vos
            </h1>
            <p className="mt-1 text-sm text-brand-600">
              Para personalizar tu experiencia en MyLocus
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label
                htmlFor="nombre"
                className="mb-1.5 block text-sm font-medium text-brand-800"
              >
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Tu nombre"
                required
                disabled={cargando}
                className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900 placeholder-brand-300 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="carrera"
                className="mb-1.5 block text-sm font-medium text-brand-800"
              >
                Carrera
              </label>
              <input
                id="carrera"
                name="carrera"
                type="text"
                placeholder="Ej: Ingeniería en Sistemas"
                required
                disabled={cargando}
                className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900 placeholder-brand-300 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="universidad"
                className="mb-1.5 block text-sm font-medium text-brand-800"
              >
                Universidad
              </label>
              <input
                id="universidad"
                name="universidad"
                type="text"
                placeholder="Ej: UBA"
                required
                disabled={cargando}
                className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900 placeholder-brand-300 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="mt-2 w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cargando ? 'Creando tu espacio...' : 'Empezar →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
