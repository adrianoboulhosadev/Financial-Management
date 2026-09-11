import { Pressable, Text, View } from 'react-native'
import type { NotificationDTO } from '@notification/adapters'
import { ACCENT, formatRelativeTime, INBOX_FILTERS, NEUTRAL, SEMANTIC } from 'ui'
import { Chip } from '@/components/chip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { EnvelopeIcon, EnvelopeOpenIcon, TrashIcon } from '@/data/icons'
import { NOTIFICATION_TYPE_ICONS } from './data/type-icons'
import { useNotificationsScreen } from './hooks/use-notifications-screen'

/**
 * The inbox. Everything in it was written by the WORKER — a ceiling crossed, a
 * fixed bill posted — and the text was rendered when it happened, because a
 * notification is the record of what was said at the time.
 *
 * Unread and read are two blocks rather than one list with a dot: "is there
 * anything new" is the question the screen is opened with, and a heading
 * answers it before any row is read.
 */
export function NotificationsScreen() {
  const screen = useNotificationsScreen()

  const row = (notification: NotificationDTO, last: boolean) => {
    const { icon, tone } = NOTIFICATION_TYPE_ICONS[notification.type]

    return (
      <ListRow key={notification.id} last={last} alignTop>
        <IconBadge icon={icon} tone={notification.read ? 'muted' : tone} />

        <Pressable className="flex-1" onPress={() => screen.open(notification)}>
          <Text
            className={`text-[13px] ${notification.read ? 'text-neutral-400' : 'text-ink-text'}`}
          >
            {notification.title}
          </Text>
          <Text
            className={`mt-[3px] text-[11.5px] leading-snug ${
              notification.read ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            {notification.body}
          </Text>
          <Text className="mt-1.5 text-[10.5px] text-neutral-700">
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </Pressable>

        <View className="mt-1 flex-row items-center gap-3.5">
          <Pressable
            onPress={() => screen.markAsRead(notification.id)}
            disabled={notification.read}
            accessibilityLabel={notification.read ? 'Já lida' : 'Marcar como lida'}
            hitSlop={8}
          >
            {notification.read ? (
              <EnvelopeOpenIcon color={NEUTRAL[700]} size={18} />
            ) : (
              <EnvelopeIcon color={ACCENT[300]} size={18} />
            )}
          </Pressable>
          <Pressable
            onPress={() => screen.remove(notification.id)}
            accessibilityLabel="Excluir notificação"
            hitSlop={8}
          >
            <TrashIcon color={NEUTRAL[600]} size={17} />
          </Pressable>
        </View>
      </ListRow>
    )
  }

  const header = (
    <ScreenHeader
      title="Notificações"
      bordered
      action={
        <View className="flex-row items-center gap-3.5">
          <Pressable
            onPress={() => screen.markAllAsRead()}
            disabled={screen.markingAll || screen.unreadCount === 0}
            hitSlop={8}
          >
            <Text
              className={`text-[11.5px] ${
                screen.unreadCount === 0 ? 'text-neutral-700' : 'text-accent-300'
              }`}
            >
              Marcar lidas
            </Text>
          </Pressable>
          <Pressable onPress={screen.askToClear} disabled={screen.items.length === 0} hitSlop={8}>
            <Text
              className="text-[11.5px]"
              style={{ color: screen.items.length === 0 ? NEUTRAL[700] : SEMANTIC.negative }}
            >
              Excluir tudo
            </Text>
          </Pressable>
        </View>
      }
    >
      <View className="mt-3.5 flex-row gap-1.5">
        {INBOX_FILTERS.map((option) => (
          <Chip
            key={option.value}
            label={
              option.value === 'unread' && screen.unreadCount > 0
                ? `${option.label} (${screen.unreadCount})`
                : option.label
            }
            active={screen.filter === option.value}
            onPress={() => screen.setFilter(option.value)}
          />
        ))}
      </View>
    </ScreenHeader>
  )

  if (screen.loading) {
    return (
      <Screen header={header}>
        <Loading />
      </Screen>
    )
  }

  const unread = screen.items.filter((item) => !item.read)
  const read = screen.items.filter((item) => item.read)

  return (
    <>
      <Screen header={header}>
        <View className="px-5 pt-3.5">
          {screen.items.length === 0 ? (
            <EmptyState
              title={screen.filter === 'unread' ? 'Nenhuma não lida' : 'Caixa de entrada vazia'}
              description="Avisos de orçamento e de lançamento fixo aparecem aqui."
            />
          ) : (
            <>
              {unread.length > 0 ? (
                <View>
                  <Kicker className="pb-1">Novas</Kicker>
                  {unread.map((item, index) => row(item, index === unread.length - 1))}
                </View>
              ) : null}

              {read.length > 0 ? (
                <View>
                  <Kicker className={`pb-1 ${unread.length > 0 ? 'pt-[18px]' : ''}`}>Antes</Kicker>
                  {read.map((item, index) => row(item, index === read.length - 1))}
                </View>
              ) : null}
            </>
          )}
        </View>
      </Screen>

      <ConfirmDialog
        open={screen.confirmingClear}
        title="Excluir todas as notificações"
        description="Isso só esvazia a caixa de entrada — nada do que aconteceu é desfeito."
        confirmLabel="Excluir todas"
        onConfirm={screen.confirmClear}
        onCancel={screen.cancelClear}
      />
    </>
  )
}
