'use client'

import Link from 'next/link'
import { useBottomTabBar } from './hooks/use-bottom-tab-bar'

/**
 * The app's navigation, full stop. There is no second shape of it: the product
 * is a phone app that happens to open in a browser, so the same five tabs sit
 * at the bottom at every width the app renders at (past 1024px the app is not
 * rendered at all — see the private layout).
 *
 * The unread dot rides the bell instead of a counted badge. The count is on the
 * notifications screen itself, one tap away; here the only question the bar has
 * to answer is whether there is anything to look at.
 */
export function BottomTabBar() {
  const { items, activeHref, hasUnread } = useBottomTabBar()

  return (
    <nav className="flex flex-none border-t border-ink-border bg-ink-surface px-1.5 pb-[max(env(safe-area-inset-bottom),12px)] pt-2.5">
      {items.map((item) => {
        const active = item.href === activeHref
        const Glyph = active ? item.activeIcon : item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-1 text-[9.5px] transition-colors ${
              active ? 'text-accent' : 'text-neutral-600'
            }`}
          >
            <span className="relative flex">
              <Glyph size={21} />
              {item.href === '/notifications' && hasUnread && (
                <span className="absolute -right-0.5 -top-px h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
