'use client'

import type { ReactNode } from 'react'
import { useProtectRoute } from '@/hooks/use-protect-route'
import { useNotificationStream } from 'client'
import { Loading } from '@/components/loading'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

/**
 * Private area shell. The two pieces of chrome (rail + top bar) are composed
 * here directly — a wrapper component that only renders those two would earn
 * nothing and would hide the layout from whoever opens this file looking for it.
 *
 * The inbox stream is opened ONCE, here, for the whole private area: one
 * EventSource per session, not one per screen.
 */
export default function PrivateLayout({ children }: { children: ReactNode }) {
  const { allowed } = useProtectRoute()
  useNotificationStream()

  if (!allowed) return <Loading fullScreen />

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  )
}
