'use client'

import type { ReactNode } from 'react'
import { useProtectRoute } from '@/hooks/use-protect-route'
import { useViewportFits } from '@/hooks/use-viewport-fits'
import { useNotificationStream } from 'ui'
import { Loading } from '@/components/loading'
import { BottomTabBar } from '@/components/bottom-tab-bar'
import { DesktopNotice } from '@/components/desktop-notice'

/**
 * Private area shell: a scrolling body with the tab bar pinned under it.
 *
 * There is no header here. Every screen carries its own (`ScreenHeader`),
 * because the top of a screen is where it differs most — one holds a month
 * pill, another a row of filter chips, another a progress bar — and a single
 * global bar could only ever have held the title, which was never the part that
 * needed sharing.
 *
 * The tab bar is a FLEX SIBLING of the scroll area rather than `fixed`. Pinning
 * it meant every screen had to remember to reserve room underneath, and the one
 * that forgot hid its last row; as a sibling the layout reserves that space
 * structurally, once.
 *
 * The inbox stream is opened ONCE, here, for the whole private area: one
 * EventSource per session, not one per screen.
 */
export default function PrivateLayout({ children }: { children: ReactNode }) {
  const { allowed } = useProtectRoute()
  const fits = useViewportFits()
  useNotificationStream()

  if (fits === null) return null
  if (!fits) return <DesktopNotice />
  if (!allowed) return <Loading fullScreen />

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <BottomTabBar />
    </div>
  )
}
