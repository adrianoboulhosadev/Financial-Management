import { Pressable, Text, View } from 'react-native'
import { NotificationsIcon } from '@/data/icons'
import { useNotificationBell } from './hooks/use-notification-bell'

// Past this the badge stops being a number and starts being "a lot".
const BADGE_CAP = 99

export function NotificationBell() {
  const { unreadCount, open } = useNotificationBell()

  return (
    <Pressable
      onPress={open}
      accessibilityLabel={
        unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : 'Notificações'
      }
      className="mr-4 p-1"
    >
      <NotificationsIcon color="#a9b8c9" size={22} />
      {unreadCount > 0 ? (
        <View className="absolute -right-1 -top-1 min-w-[18px] items-center rounded-full bg-accent px-1">
          <Text className="text-[10px] font-semibold text-ink-bg">
            {unreadCount > BADGE_CAP ? `${BADGE_CAP}+` : unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  )
}
