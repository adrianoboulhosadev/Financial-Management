'use client'

import type { ReactNode } from 'react'
import { useRedirectAuthenticated } from '@/hooks/use-redirect-authenticated'
import { Loading } from '@/components/loading'

/**
 * Public area (login/register/pending). The guard sends an already-signed-in
 * visitor to the dashboard.
 *
 * The centered card chrome lives HERE and not in each page: all three screens
 * wrap the same box, and repeating it three times only because each route has
 * its own file is repetition for nothing. The loading guard stays OUTSIDE the
 * wrapper — it claims the whole viewport, which the card's max-width would
 * squeeze.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  const { allowed } = useRedirectAuthenticated()

  if (!allowed) return <Loading fullScreen />

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(120%_120%_at_50%_0%,#16212e_0%,#0b1016_60%)] px-6 py-12">
      <div className="w-full max-w-md animate-fadeIn rounded-card border border-ink-border bg-ink-surface p-8 shadow-card">
        {children}
      </div>
    </main>
  )
}
