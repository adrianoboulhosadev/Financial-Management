import { Link } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { LogoutIcon } from '@/data/icons'
import { Screen } from '@/components/screen'
import { useMore } from './hooks/use-more'

export function MoreScreen() {
  const { user, items, logout } = useMore()

  return (
    <Screen>
      {user ? (
        <View className="rounded-card border border-ink-border bg-ink-surface p-4">
          <Text className="text-sm font-medium text-ink-text">{user.nickname || user.email}</Text>
          <Text className="mt-0.5 text-xs text-ink-text-muted">{user.email}</Text>
        </View>
      ) : null}

      <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
        {items.map((item, index) => (
          <Link key={item.href} href={item.href as never} asChild>
            <Pressable
              className={`flex-row items-center gap-3 px-4 py-3.5 ${
                index > 0 ? 'border-t border-ink-border' : ''
              }`}
            >
              <item.icon color="#6d8096" />
              <Text className="text-sm text-ink-text">{item.label}</Text>
            </Pressable>
          </Link>
        ))}

        <Pressable
          onPress={() => logout()}
          className="flex-row items-center gap-3 border-t border-ink-border px-4 py-3.5"
        >
          <LogoutIcon color="#f87171" />
          <Text className="text-sm text-negative">Sair</Text>
        </Pressable>
      </View>
    </Screen>
  )
}
