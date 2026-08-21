import type { ReactNode } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'

interface ScreenProps {
  children: ReactNode
  /** Pull-to-refresh, when the screen has something worth re-reading. */
  onRefresh?: () => void
  refreshing?: boolean
  /** For a screen that manages its own scrolling (a long list). */
  scroll?: boolean
}

/**
 * The padding and scroll behaviour every screen shares. The safe area is
 * handled by the navigator (see the private layout), so this only owns the
 * content box — which is what keeps every screen's gutter identical.
 */
export function Screen({ children, onRefresh, refreshing = false, scroll = true }: ScreenProps) {
  if (!scroll) return <View className="flex-1 bg-ink-bg px-4 pt-4">{children}</View>

  return (
    <ScrollView
      className="flex-1 bg-ink-bg"
      contentContainerClassName="px-4 pt-4 pb-8 gap-4"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f9cf9" />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  )
}
