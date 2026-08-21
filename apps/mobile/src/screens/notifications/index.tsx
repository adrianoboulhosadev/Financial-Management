import { Pressable, Text, View } from 'react-native'
import { accentFor, formatRelativeTime, INBOX_FILTERS } from 'ui'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Loading } from '@/components/loading'
import { Screen } from '@/components/screen'
import { SegmentedControl } from '@/components/segmented-control'
import { useNotificationsScreen } from './hooks/use-notifications-screen'

export function NotificationsScreen() {
  const screen = useNotificationsScreen()

  if (screen.loading) return <Loading />

  return (
    <>
      <Screen>
        <SegmentedControl
          options={INBOX_FILTERS}
          value={screen.filter}
          onChange={screen.setFilter}
        />

        <View className="flex-row gap-2">
          <Button
            label="Marcar todas como lidas"
            variant="secondary"
            className="flex-1"
            onPress={() => screen.markAllAsRead()}
            disabled={screen.markingAll || screen.unreadCount === 0}
          />
          <Button
            label="Excluir todas"
            variant="danger"
            onPress={screen.askToClear}
            disabled={screen.items.length === 0}
          />
        </View>

        {screen.items.length === 0 ? (
          <EmptyState
            title={screen.filter === 'unread' ? 'Nenhuma não lida' : 'Caixa de entrada vazia'}
            description="Avisos de orçamento e de lançamento fixo aparecem aqui."
          />
        ) : (
          <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {screen.items.map((notification, index) => (
              <View
                key={notification.id}
                className={`flex-row gap-3 px-4 py-3.5 ${
                  index > 0 ? 'border-t border-ink-border' : ''
                } ${notification.read ? '' : 'bg-ink-surface-soft'}`}
              >
                <View
                  className="mt-1.5 h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: accentFor(notification.type),
                    opacity: notification.read ? 0.35 : 1,
                  }}
                />

                <Pressable className="flex-1" onPress={() => screen.open(notification)}>
                  <View className="flex-row items-baseline justify-between gap-2">
                    <Text
                      className={`flex-1 text-sm font-medium ${notification.read ? 'text-ink-text-soft' : 'text-ink-text'}`}
                    >
                      {notification.title}
                    </Text>
                    <Text className="text-xs text-ink-text-muted">
                      {formatRelativeTime(notification.createdAt)}
                    </Text>
                  </View>
                  <Text className="mt-0.5 text-sm leading-snug text-ink-text-muted">
                    {notification.body}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => screen.remove(notification.id)}
                  accessibilityLabel="Excluir notificação"
                  className="px-2"
                >
                  <Text className="text-ink-text-muted">✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
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
