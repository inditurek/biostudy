'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function completarOnboarding(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const nombre = formData.get('nombre') as string
  const carrera = formData.get('carrera') as string
  const universidad = formData.get('universidad') as string

  // 1. Crear el perfil del usuario
  const { error: perfilError } = await supabase.from('perfiles').insert({
    id: user.id,
    email: user.email!,
    nombre,
    carrera,
    universidad,
  })

  if (perfilError) {
    // Si el perfil ya existe (por algún retry), ignoramos el error y seguimos
    if (perfilError.code !== '23505') {
      throw new Error(`Error creando perfil: ${perfilError.message}`)
    }
  }

  // 2. Crear un cuaderno de ejemplo para que la app no quede vacía
  const { data: cuaderno } = await supabase
    .from('cuadernos')
    .insert({
      usuario_id: user.id,
      nombre: 'Mi primer cuaderno',
      color: '#7c3aed',
      orden: 0,
    })
    .select()
    .single()

  // 3. Crear un separador de ejemplo dentro del cuaderno
  if (cuaderno) {
    await supabase.from('separadores').insert({
      cuaderno_id: cuaderno.id,
      nombre: 'Clase 1',
      color: '#7c3aed',
      orden: 0,
    })
  }

  redirect('/cuadernos')
}
