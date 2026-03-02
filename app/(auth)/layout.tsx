// Layout minimalista para las páginas de autenticación (login, etc.)
// Sin sidebar ni navegación — solo el contenido centrado
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50">
      {children}
    </div>
  )
}
