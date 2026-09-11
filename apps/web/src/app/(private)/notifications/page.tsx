'use client'

import { formatRelativeTime, INBOX_FILTERS } from 'ui'
import { Chip } from '@/components/chip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { ScreenHeader } from '@/components/screen-header'
import { EnvelopeIcon, EnvelopeOpenIcon, TrashIcon } from '@/data/icons'
import { NOTIFICATION_TYPE_ICONS } from './data/type-icons'
import { useNotificationsInbox } from './hooks/use-notifications-inbox'

/**
 * The inbox. Everything in it was written by the WORKER — a ceiling crossed, a
 * fixed bill posted — and the text was rendered when it happened, because a
 * notification is the record of what was said at the time, not a template
 * re-evaluated against today's numbers.
 *
 * Unread and read are two blocks rather than one list with a dot: "is there
 * anything new" is the question the screen is opened with, and a heading
 * answers it before any row is read.
 */
export default function NotificationsPage() {
  const page = useNotificationsInbox()

  if (page.loading) return <Loading />

  const unread = page.items.filter((item) => !item.read)
  const read = page.items.filter((item) => item.read)

  const row = (
    notification: (typeof page.items)[number],
    last: boolean,
  ) => {
    const { icon, tone } = NOTIFICATION_TYPE_ICONS[notification.type]

    return (
      // Not a single <button> wrapping everything: nesting the action buttons
      // inside it would be invalid HTML and make them unreachable.
      <ListRow key={notification.id} last={last} alignTop>
        <IconBadge tone={notification.read ? 'muted' : tone}>{icon}</IconBadge>

        <button
          type="button"
          onClick={() => page.open(notification)}
          className="min-w-0 flex-1 text-left"
        >
          <span
            className={`block text-[13px] ${notification.read ? 'text-neutral-400' : 'text-ink-text'}`}
          >
            {notification.title}
          </span>
          <span
            className={`mt-[3px] block text-[11.5px] leading-snug ${
              notification.read ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            {notification.body}
          </span>
          <span className="mt-1.5 block text-[10.5px] text-neutral-700">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </button>

        <span className="mt-1 flex flex-none items-center gap-3.5">
          <button
            type="button"
            onClick={() => page.markAsRead(notification.id)}
            disabled={notification.read}
            aria-label={notification.read ? 'Já lida' : 'Marcar como lida'}
            className={notification.read ? 'text-neutral-700' : 'text-accent-300'}
          >
            {notification.read ? <EnvelopeOpenIcon size={18} /> : <EnvelopeIcon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => page.remove(notification.id)}
            aria-label="Excluir notificação"
            className="text-neutral-600 transition-colors hover:text-negative"
          >
            <TrashIcon size={17} />
          </button>
        </span>
      </ListRow>
    )
  }

  return (
    <>
      <ScreenHeader
        title="Notificações"
        bordered
        action={
          <span className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => page.markAllAsRead()}
              disabled={page.markingAll || page.unreadCount === 0}
              className="text-[11.5px] text-accent-300 disabled:text-neutral-700"
            >
              Marcar lidas
            </button>
            <button
              type="button"
              onClick={page.askToClear}
              disabled={page.items.length === 0}
              className="text-[11.5px] text-negative disabled:text-neutral-700"
            >
              Excluir tudo
            </button>
          </span>
        }
      >
        <div className="mt-3.5 flex gap-1.5">
          {INBOX_FILTERS.map((option) => (
            <Chip
              key={option.value}
              active={page.filter === option.value}
              onClick={() => page.setFilter(option.value)}
            >
              {option.label}
              {option.value === 'unread' && page.unreadCount > 0 && ` (${page.unreadCount})`}
            </Chip>
          ))}
        </div>
      </ScreenHeader>

      <div className="px-5 pb-8 pt-3.5">
        {page.items.length === 0 ? (
          <EmptyState
            title={page.filter === 'unread' ? 'Nenhuma não lida' : 'Caixa de entrada vazia'}
            description="Avisos de orçamento e de lançamento fixo aparecem aqui."
          />
        ) : (
          <>
            {unread.length > 0 && (
              <section>
                <Kicker className="pb-1">Novas</Kicker>
                {unread.map((item, index) => row(item, index === unread.length - 1))}
              </section>
            )}

            {read.length > 0 && (
              <section>
                <Kicker className={`pb-1 ${unread.length > 0 ? 'pt-[18px]' : ''}`}>Antes</Kicker>
                {read.map((item, index) => row(item, index === read.length - 1))}
              </section>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={page.confirmingClear}
        title="Excluir todas as notificações"
        description="Isso só esvazia a caixa de entrada — nada do que aconteceu é desfeito."
        confirmLabel="Excluir todas"
        onConfirm={page.confirmClear}
        onCancel={page.cancelClear}
      />
    </>
  )
}
