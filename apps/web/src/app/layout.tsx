import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { Toaster } from '@/components/toaster'

// Amounts are read in columns and compared at a glance, so they get a
// monospace with tabular figures; everything else is the UI sans.
const sansFont = Inter({ subsets: ['latin'], variable: '--font-sans' })
const monoFont = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Financial',
  description: 'Controle de gastos: categorias, orçamentos e quanto sobra no mês.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sansFont.variable} ${monoFont.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
