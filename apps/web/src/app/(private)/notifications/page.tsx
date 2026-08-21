'use client'

import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Loading } from '@/components/loading'
import { formatRelativeTime } from 'ui'
import { accentFor } from 'ui'
import { INBOX_FILTERS } from './data/inbox-filters'
import { useNotificationsInbox } from './hooks/use-notifications-inbox'

export default function NotificationsPage() {
  const page = useNotificationsInbox()

  if (page.loading) return <Loading />

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-ink-border p-1">
          {INBOX_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => page.setFilter(option.value)}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                page.filter === option.value
                  ? 'bg-ink-surface-soft text-ink-text'
                  : 'text-ink-text-muted hover:text-ink-text'
              }`}
            >
              {option.label}
              {option.value === 'unread' && page.unreadCount > 0 && ` (${page.unreadCount})`}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => page.markAllAsRead()}
            disabled={page.markingAll || page.unreadCount === 0}
          >
            Marcar todas como lidas
          </Button>
          <Button variant="danger" onClick={page.askToClear} disabled={page.items.length === 0}>
            Excluir todas
          </Button>
        </div>
      </div>

      {page.items.length === 0 ? (
        <EmptyState
          title={page.filter === 'unread' ? 'Nenhuma não lida' : 'Caixa de entrada vazia'}
          description="Avisos de orçamento e de lançamento fixo aparecem aqui."
        />
      ) : (
        <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
          {page.items.map((notification) => (
            // Not a single <button> wrapping everything: nesting the delete
            // button inside it would be invalid HTML and make the inner one
            // unreachable.
            <li
              key={notification.id}
              className={`flex gap-3 px-4 py-3.5 ${notification.read ? '' : 'bg-ink-surface-soft/50'}`}
            >
              <span
                className="mt-1.5 h-2 w-2 flex-none rounded-full"
                style={{
                  backgroundColor: accentFor(notification.type),
                  opacity: notification.read ? 0.35 : 1,
                }}
              />

              <button
                type="button"
                onClick={() => page.open(notification)}
                className="min-w-0 flex-1 text-left"
              >
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
                <span className="mt-0.5 block text-sm leading-snug text-ink-text-muted">
                  {notification.body}
                </span>
              </button>

              <button
                type="button"
                onClick={() => page.remove(notification.id)}
                aria-label="Excluir notificação"
                className="h-fit rounded px-2 py-1 text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-negative"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={page.confirmingClear}
        title="Excluir todas as notificações"
        description="Isso só esvazia a caixa de entrada — nada do que aconteceu é desfeito."
        confirmLabel="Excluir todas"
        onConfirm={page.confirmClear}
        onCancel={page.cancelClear}
      />
    </div>
  )
}
