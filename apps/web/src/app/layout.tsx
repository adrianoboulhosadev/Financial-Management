import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { COLORS } from 'ui'
import './globals.css'
import { Providers } from '@/providers'
import { Toaster } from '@/components/toaster'
import { PwaRegister } from '@/components/pwa-register'

// Amounts are read in columns and compared at a glance, so they get a
// monospace with tabular figures; everything else is the UI sans.
const sansFont = Inter({ subsets: ['latin'], variable: '--font-sans' })
const monoFont = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Financial',
  description: 'Controle de gastos: categorias, orçamentos e quanto sobra no mês.',
  // app/manifest.ts wires the <link rel="manifest"> by itself; these two point
  // at the routes in app/icons/ — custom routes rather than the reserved
  // icon.tsx/apple-icon.tsx filenames, so the exact URL stays ours to control
  // and to match against the manifest's icon list.
  icons: {
    icon: '/icons/favicon',
    apple: '/icons/apple-touch-icon',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Financial',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: COLORS.ink.bg,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sansFont.variable} ${monoFont.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  )
}
