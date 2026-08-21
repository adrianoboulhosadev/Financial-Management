'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { AuthProvider, configureClient, WEB_CLIENT_DEFAULTS } from 'ui'
import { notifier } from '@/lib/notify'

/**
 * Wires the shared client to the WEB's platform adapters, once, before anything
 * renders: sonner for feedback, the browser's own EventSource for the live
 * inbox, and no token storage at all — on the web the refresh lives in an
 * httpOnly cookie the browser attaches by itself (see the TokenStorage port).
 *
 * Runs at module scope, not in an effect: a hook that renders before this ran
 * would find no configuration.
 */
configureClient({
  ...WEB_CLIENT_DEFAULTS,
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000',
  notifier,
  eventStream: {
    open(url, onMessage) {
      const source = new EventSource(url, { withCredentials: true })
      source.onmessage = onMessage
      // No manual retry on purpose: EventSource already reconnects on its own,
      // and closing it is exactly what would break that.
      return () => source.close()
    },
  },
})

/* Gathers the application's global providers */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
