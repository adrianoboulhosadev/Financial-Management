import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { COLORS } from 'ui'
import './globals.css'
import { Providers } from '@/providers'
import { Toaster } from '@/components/toaster'
import { PwaRegister } from '@/components/pwa-register'

// ONE family for the whole product. Amounts are read in columns and compared at
// a glance, and what makes that work is TABULAR FIGURES (`tabular-nums` on
// <Amount>), not a second, monospaced typeface — the digits were already
// fixed-width, so the extra webfont bought nothing.
const sansFont = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Financial Management',
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
    title: 'Financial Management',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: COLORS.ink.bg,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={sansFont.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  )
}
