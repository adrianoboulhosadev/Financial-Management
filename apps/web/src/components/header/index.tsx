'use client'

import { NotificationBell } from '../notification-bell'
import { useHeader } from './hooks/use-header'

/** Top bar of the private area: which screen you are on, and the inbox. */
export function Header() {
  const { title } = useHeader()

  return (
    <header className="sticky top-0 z-50 flex flex-none flex-wrap items-center justify-between gap-3 border-b border-ink-border bg-ink-bg/90 px-4 py-3.5 backdrop-blur sm:px-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <NotificationBell />
    </header>
  )
}
