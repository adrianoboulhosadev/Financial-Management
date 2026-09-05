import type { MetadataRoute } from 'next'
import { COLORS } from 'ui'

/**
 * Next wires the <link rel="manifest"> from this file automatically.
 *
 * `start_url` is the root, which redirects to /dashboard and lets the private
 * layout decide between the month and the login screen — the installed app then
 * opens exactly where the browser tab would.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Financial Management',
    short_name: 'Financial Management',
    description: 'Controle de gastos: categorias, orçamentos e quanto sobra no mês.',
    start_url: '/',
    display: 'standalone',
    background_color: COLORS.ink.bg,
    theme_color: COLORS.ink.bg,
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
