import { Text, View } from 'react-native'
import type { UserDTO } from '@auth/adapters'
import { APPROVAL_STATUS_CLASSES, APPROVAL_STATUS_LABELS, formatDate } from 'ui'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { Loading } from '@/components/loading'
import { Screen } from '@/components/screen'
import { useAdminScreen } from './hooks/use-admin-screen'

export function AdminScreen() {
  const screen = useAdminScreen()

  if (screen.loading) return <Loading />

  const row = (user: UserDTO) => (
    <View key={user.id} className="gap-2 border-b border-ink-border px-4 py-3">
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <Text className="text-sm font-medium text-ink-text" numberOfLines={1}>
            {user.nickname || user.email}
          </Text>
          <Text className="mt-0.5 text-xs text-ink-text-muted" numberOfLines={1}>
            {user.email} · desde {formatDate(user.createdAt)}
            {user.role === 'admin' ? ' · admin' : ''}
          </Text>
        </View>

        <View
          className={`rounded-full px-2.5 py-1 ${APPROVAL_STATUS_CLASSES[user.approvalStatus]}`}
        >
          <Text className="text-xs">{APPROVAL_STATUS_LABELS[user.approvalStatus]}</Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        {user.approvalStatus !== 'approved' ? (
          <Button
            label="Liberar"
            className="flex-1"
            onPress={() => screen.approve(user.id)}
            disabled={screen.deciding}
          />
        ) : null}
        {user.approvalStatus !== 'rejected' ? (
          <Button
            label="Bloquear"
            variant="danger"
            className="flex-1"
            onPress={() => screen.reject(user.id)}
            disabled={screen.deciding}
          />
        ) : null}
      </View>
    </View>
  )

  return (
    <Screen>
      <Text className="text-sm font-semibold text-ink-text">Aguardando liberação</Text>
      {screen.pending.length === 0 ? (
        <EmptyState title="Ninguém na fila" description="Todo cadastro novo aparece aqui." />
      ) : (
        <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
          {screen.pending.map(row)}
        </View>
      )}

      <Text className="text-sm font-semibold text-ink-text">Contas</Text>
      <Text className="text-xs text-ink-text-soft">
        Bloquear também revoga o acesso de quem já está dentro: as sessões abertas caem na hora.
      </Text>
      <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
        {screen.others.map(row)}
      </View>
    </Screen>
  )
}
