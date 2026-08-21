'use client'

import Link from 'next/link'
import { MoreIcon } from '@/data/icons'
import { MORE_ROUTE } from '@/data/nav-items'
import { useBottomTabBar } from './hooks/use-bottom-tab-bar'

/**
 * Navigation on a phone. It exists because the sidebar is desktop-only, and
 * without it the app had NO way to change screens on a narrow viewport.
 *
 * Four primary destinations plus "Mais" — the same five slots the mobile app
 * uses, which is what makes the browser at phone width and the installed app
 * read as the same product.
 */
export function BottomTabBar() {
  const { items, isActive, moreActive } = useBottomTabBar()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] flex border-t border-ink-border bg-ink-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
            isActive(item.href) ? 'text-accent' : 'text-ink-text-muted'
          }`}
        >
          <item.icon />
          {item.shortLabel ?? item.label}
        </Link>
      ))}

      <Link
        href={MORE_ROUTE}
        className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
          moreActive ? 'text-accent' : 'text-ink-text-muted'
        }`}
      >
        <MoreIcon />
        Mais
      </Link>
    </nav>
  )
}
