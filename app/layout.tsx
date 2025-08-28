import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dimension - Next.js Template',
  description: 'A modern, responsive site template built with Next.js, TypeScript, and Tailwind CSS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
