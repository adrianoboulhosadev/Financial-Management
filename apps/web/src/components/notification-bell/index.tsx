'use client'

import Link from 'next/link'
import { formatRelativeTime } from 'ui'
import { accentFor } from 'ui'
import { NotificationsIcon } from '../sidebar/data/icons'
import { useNotificationBell } from './hooks/use-notification-bell'

// Past this the badge stops being a number and starts being "a lot".
const BADGE_CAP = 99

export function NotificationBell() {
  const { containerRef, open, toggle, close, items, unreadCount, openNotification } =
    useNotificationBell()

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : 'Notificações'}
        aria-expanded={open}
        className={`relative grid h-10 w-10 place-items-center rounded-lg border transition-colors ${
          open
            ? 'border-accent bg-ink-surface text-accent'
            : 'border-ink-border bg-ink-surface text-ink-text-soft hover:border-ink-border-strong hover:text-ink-text'
        }`}
      >
        <NotificationsIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-ink-bg">
            {unreadCount > BADGE_CAP ? `${BADGE_CAP}+` : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-card border border-ink-border bg-ink-surface shadow-card">
          <div className="flex items-center justify-between border-b border-ink-border px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-text-muted">
              Notificações
            </span>
            {unreadCount > 0 && (
              <span className="text-xs text-accent">
                {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-text-muted">Nada por aqui ainda.</p>
          ) : (
            <ul className="max-h-[320px] overflow-y-auto">
              {items.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={`flex w-full gap-3 border-b border-ink-border px-4 py-3 text-left transition-colors hover:bg-ink-surface-soft ${
                      notification.read ? '' : 'bg-ink-surface-soft/60'
                    }`}
                  >
                    <span
                      className="mt-1.5 h-2 w-2 flex-none rounded-full"
                      style={{
                        backgroundColor: accentFor(notification.type),
                        // A read line keeps its colour, dimmed — the dot is what
                        // says "new", the hue says what kind of news it is.
                        opacity: notification.read ? 0.35 : 1,
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={`text-sm font-medium ${notification.read ? 'text-ink-text-soft' : 'text-ink-text'}`}
                        >
                          {notification.title}
                        </span>
                        <span className="flex-none text-xs text-ink-text-muted">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-ink-text-muted">
                        {notification.body}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/notifications"
            onClick={close}
            className="block px-4 py-3 text-center text-xs font-medium text-accent hover:bg-ink-surface-soft"
          >
            Ver todas
          </Link>
        </div>
      )}
    </div>
  )
}
