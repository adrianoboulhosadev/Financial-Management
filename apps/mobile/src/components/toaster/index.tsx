import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useToaster } from './hooks/use-toaster'

/**
 * The phone's counterpart to sonner. Mounted once in the root layout; anywhere
 * else, code calls `notify` (see lib/notify), exactly like on the web.
 */
export function Toaster() {
  const { toasts } = useToaster()
  const insets = useSafeAreaInsets()

  if (toasts.length === 0) return null

  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 z-50 gap-2 px-4"
      style={{ top: insets.top + 8 }}
    >
      {toasts.map((toast) => (
        <View
          key={toast.id}
          className={`rounded-card border bg-ink-surface p-4 ${
            toast.tone === 'success' ? 'border-positive/50' : 'border-negative/50'
          }`}
        >
          <Text className={toast.tone === 'success' ? 'text-positive' : 'text-negative'}>
            {toast.message}
          </Text>
        </View>
      ))}
    </View>
  )
}
