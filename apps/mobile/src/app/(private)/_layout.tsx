import { Stack } from 'expo-router'
import { COLORS, useNotificationStream } from 'ui'
import { useProtectRoute } from '@/hooks/use-protect-route'
import { Loading } from '@/components/loading'

/**
 * Private area. The guard runs here, once, and the inbox stream opens here too
 * — one connection per session, not one per screen (same rule as the web's
 * private layout).
 *
 * Headers are off for the whole stack: every screen draws its own, so the back
 * caret in `<ScreenHeader>` is the one the owner sees. The tab navigator is a
 * child route and the secondary screens are pushed on top of it.
 */
export default function PrivateLayout() {
  const { allowed } = useProtectRoute()
  useNotificationStream()

  if (!allowed) return <Loading fullScreen />

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.ink.bg },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="checklist" />
      <Stack.Screen name="budgets" />
      <Stack.Screen name="recurrences" />
      <Stack.Screen name="investments" />
      <Stack.Screen name="banks" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="profile" />
    </Stack>
  )
}
