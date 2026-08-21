'use client'

import Link from 'next/link'
import { mediaUrl } from 'ui'
import { LogoutIcon } from '@/data/icons'
import { useSidebar } from './hooks/use-sidebar'

/** Navigation rail of the private area. Collapsed it shows only the icons;
 * clicking the mark widens it and fades the labels in. */
export function Sidebar() {
  const { user, logout, expanded, toggle, items, isActive, displayName, initials } = useSidebar()

  return (
    <aside
      className="z-[60] hidden h-screen flex-none flex-col overflow-hidden border-r border-ink-border bg-ink-surface transition-[width] duration-200 sm:flex"
      style={{ width: expanded ? 236 : 68 }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
        className="flex w-full items-center gap-3 border-b border-ink-border px-4 py-4 text-left"
      >
        <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-accent font-semibold text-ink-bg">
          F
        </span>
        <span
          className={`whitespace-nowrap font-semibold tracking-tight transition-opacity ${expanded ? 'opacity-100' : 'opacity-0'}`}
        >
          Financial
        </span>
      </button>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive(item.href)
                ? 'bg-accent/10 text-accent'
                : 'text-ink-text-soft hover:bg-ink-surface-soft hover:text-ink-text'
            }`}
          >
            <item.icon />
            <span
              className={`whitespace-nowrap transition-opacity ${expanded ? 'opacity-100' : 'opacity-0'}`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="flex-none border-t border-ink-border p-2">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-ink-surface-soft"
        >
          <span className="grid h-8 w-8 flex-none place-items-center overflow-hidden rounded-full bg-ink-surface-soft text-xs font-medium text-ink-text-soft">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(user.avatarUrl)} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <span
            className={`min-w-0 whitespace-nowrap transition-opacity ${expanded ? 'opacity-100' : 'opacity-0'}`}
          >
            <span className="block truncate text-sm text-ink-text">{displayName}</span>
            <span className="block text-xs text-ink-text-muted">Ver perfil</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-negative"
        >
          <LogoutIcon />
          <span
            className={`whitespace-nowrap transition-opacity ${expanded ? 'opacity-100' : 'opacity-0'}`}
          >
            Sair
          </span>
        </button>
      </div>
    </aside>
  )
}
