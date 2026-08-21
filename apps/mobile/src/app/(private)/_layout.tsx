import { Stack } from 'expo-router'
import { useNotificationStream } from 'client'
import { useProtectRoute } from '@/hooks/use-protect-route'
import { Loading } from '@/components/loading'
import { NotificationBell } from '@/components/notification-bell'

/**
 * Private area. The guard runs here, once, and the inbox stream opens here too
 * — one connection per session, not one per screen (same rule as the web's
 * private layout).
 *
 * The tab navigator is a child route; the secondary screens are pushed on top
 * of it, which is what gives them a back button for free.
 */
export default function PrivateLayout() {
  const { allowed } = useProtectRoute()
  useNotificationStream()

  if (!allowed) return <Loading fullScreen />

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#121a23' },
        headerTintColor: '#e7eef6',
        headerTitleStyle: { fontFamily: 'Inter-SemiBold' },
        contentStyle: { backgroundColor: '#0b1016' },
        headerRight: () => <NotificationBell />,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="recurrences" options={{ title: 'Fixos do mês' }} />
      <Stack.Screen name="categories" options={{ title: 'Categorias' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notificações' }} />
      <Stack.Screen name="profile" options={{ title: 'Perfil' }} />
      <Stack.Screen name="admin" options={{ title: 'Contas' }} />
    </Stack>
  )
}
