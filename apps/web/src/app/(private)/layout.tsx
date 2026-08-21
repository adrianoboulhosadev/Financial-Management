'use client'

import type { ReactNode } from 'react'
import { useProtectRoute } from '@/hooks/use-protect-route'
import { useNotificationStream } from 'client'
import { Loading } from '@/components/loading'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { BottomTabBar } from '@/components/bottom-tab-bar'

/**
 * Private area shell. The two pieces of chrome (rail + top bar) are composed
 * here directly — a wrapper component that only renders those two would earn
 * nothing and would hide the layout from whoever opens this file looking for it.
 *
 * The inbox stream is opened ONCE, here, for the whole private area: one
 * EventSource per session, not one per screen.
 *
 * Navigation is the SAME set of destinations either way, in the shape each
 * viewport expects: a rail on the desktop, a bottom tab bar on a phone. The
 * `<main>` pads its bottom by the bar's height so the last row of a list is
 * never stuck underneath it.
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
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pb-6">{children}</main>
        <BottomTabBar />
      </div>
    </div>
  )
}
