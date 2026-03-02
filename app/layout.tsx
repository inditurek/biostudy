import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'

// Fraunces: fuente serif para títulos y headings
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
})

// DM Sans: fuente sans-serif para el cuerpo de texto
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'MyLocus',
  description: 'Tu espacio de estudio universitario',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${dmSans.variable} font-dm-sans`}>
        {children}
      </body>
    </html>
  )
}
