import { Stack } from 'expo-router'
import { View } from 'react-native'
import { useRedirectAuthenticated } from '@/hooks/use-redirect-authenticated'
import { Loading } from '@/components/loading'

/**
 * Public area (login/register/pending). The guard sends an already-signed-in
 * visitor to the dashboard.
 *
 * The header is off: these three screens are their own full-page composition,
 * exactly like the web's centred card.
 */
export default function PublicLayout() {
  const { allowed } = useRedirectAuthenticated()

  if (!allowed) return <Loading fullScreen />

  return (
    <View className="flex-1 bg-ink-bg">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0b1016' } }} />
    </View>
  )
}
