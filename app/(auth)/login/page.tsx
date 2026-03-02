'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const supabase = createClient()

    // Magic Link: Supabase envía un email con un enlace para iniciar sesión
    // sin necesidad de contraseña — ideal para una app personal
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError('Hubo un problema al enviar el email. Intentá de nuevo.')
      setCargando(false)
      return
    }

    setEnviado(true)
    setCargando(false)
  }

  return (
    <div className="w-full max-w-sm px-4">
      {/* Card */}
      <div className="rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-brand-200">

        {/* Logo / título */}
        <div className="mb-8 text-center">
          <h1 className="font-fraunces text-3xl font-semibold text-brand-900">
            MyLocus
          </h1>
          <p className="mt-1 text-sm text-brand-600">
            Tu espacio de estudio universitario
          </p>
        </div>

        {enviado ? (
          /* Estado: email enviado */
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              <span className="text-2xl">📬</span>
            </div>
            <h2 className="font-fraunces text-lg font-medium text-brand-900">
              Revisá tu email
            </h2>
            <p className="mt-2 text-sm text-brand-600">
              Te enviamos un enlace a{' '}
              <span className="font-medium text-brand-800">{email}</span>.
              Hacé clic en él para entrar.
            </p>
            <button
              onClick={() => { setEnviado(false); setEmail('') }}
              className="mt-6 text-sm text-brand-500 underline underline-offset-2 hover:text-brand-700"
            >
              Usar otro email
            </button>
          </div>
        ) : (
          /* Estado: formulario */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-brand-800"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900 placeholder-brand-300 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando || !email}
              className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cargando ? 'Enviando...' : 'Entrar con Magic Link'}
            </button>

            <p className="text-center text-xs text-brand-400">
              Te enviamos un enlace al email — sin contraseña.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
