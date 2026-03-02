import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Creamos una respuesta base que podemos modificar con cookies actualizadas
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // El cliente de Supabase en el middleware necesita leer y escribir cookies
  // directamente en el request/response (no puede usar next/headers)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Primero seteamos en el request para que los Server Components lo lean
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Luego actualizamos la respuesta con las cookies nuevas
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescamos la sesión del usuario — esto mantiene la sesión activa
  // IMPORTANTE: usar getUser() y no getSession() para validar con el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const esRutaPublica =
    pathname.startsWith('/login') || pathname.startsWith('/auth')

  // Si no está autenticado e intenta acceder a una ruta protegida → login
  if (!user && !esRutaPublica) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si ya está autenticado e intenta ir al login → home
  if (user && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto archivos estáticos e imágenes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
