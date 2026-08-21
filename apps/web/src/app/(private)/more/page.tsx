'use client'

import Link from 'next/link'
import { LogoutIcon } from '@/data/icons'
import { useMore } from './hooks/use-more'

/**
 * The phone's overflow menu. It only exists below `sm`: on a desktop every one
 * of these is already a row in the sidebar, so landing here would be a dead end
 * — hence the redirect note in the layout's padding rather than a second nav.
 */
export default function MorePage() {
  const { items, logout } = useMore()

  return (
    <div className="mx-auto max-w-md">
      <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-ink-surface-soft"
            >
              <item.icon className="text-ink-text-muted" />
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-negative transition-colors hover:bg-ink-surface-soft"
          >
            <LogoutIcon />
            Sair
          </button>
        </li>
      </ul>
    </div>
  )
}
