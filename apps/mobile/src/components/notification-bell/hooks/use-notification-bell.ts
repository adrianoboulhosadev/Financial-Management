import { useRouter } from 'expo-router'
import { useNotifications } from 'ui'

/** The bell only needs the badge here — tapping it opens the inbox screen,
 * which on a phone is a better answer than a dropdown panel. */
export function useNotificationBell() {
  const router = useRouter()
  const { unreadCount } = useNotifications(1)

  return {
    unreadCount,
    open: () => router.push('/notifications'),
  }
}
