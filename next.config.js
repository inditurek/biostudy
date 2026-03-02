/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Evita que la app se cargue dentro de un iframe (protege contra clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Evita que el browser adivine el tipo de archivo (protege contra MIME sniffing)
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Controla qué información de referencia se envía al navegar a otros sitios
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restringe el acceso a APIs del browser que la app no necesita
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // Content Security Policy: define de dónde se pueden cargar recursos
  // - 'self': solo del mismo origen
  // - fonts.googleapis.com / fonts.gstatic.com: fuentes de Google (Fraunces, DM Sans)
  // - supabase.co: llamadas a la API de Supabase
  // - 'unsafe-inline': requerido por Next.js para estilos de Tailwind
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
