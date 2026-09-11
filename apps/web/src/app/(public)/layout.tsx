'use client'

import type { ReactNode } from 'react'
import { useRedirectAuthenticated } from '@/hooks/use-redirect-authenticated'
import { useViewportFits } from '@/hooks/use-viewport-fits'
import { Loading } from '@/components/loading'
import { DesktopNotice } from '@/components/desktop-notice'

/**
 * Public area (login/register). The guard sends an already-signed-in visitor to
 * the dashboard, and the width gate is the same one the private area uses —
 * the door has to agree with the room about what this product runs on.
 *
 * The chrome here is only the full-height column. The card that used to wrap
 * both screens is gone: these are full screens now, with the heading pinned
 * left and the body vertically centred, which is what an app's first screen
 * looks like. A floating box in the middle of a phone is a web page's idea.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  const { allowed } = useRedirectAuthenticated()
  const fits = useViewportFits()

  if (fits === null) return null
  if (!fits) return <DesktopNotice />
  if (!allowed) return <Loading fullScreen />

  return <div className="flex h-[100dvh] flex-col overflow-hidden">{children}</div>
}
