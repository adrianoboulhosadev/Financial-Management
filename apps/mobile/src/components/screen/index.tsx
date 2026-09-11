import type { ReactNode } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import { ACCENT } from 'ui'

interface ScreenProps {
  children: ReactNode
  /**
   * The screen's own header (see `<ScreenHeader>`). It renders OUTSIDE the
   * scroll view on purpose: in this design the title, the month pill and the
   * filter chips stay put while the list moves under them.
   */
  header?: ReactNode
  /** Pull-to-refresh, when the screen has something worth re-reading. */
  onRefresh?: () => void
  refreshing?: boolean
  /** For a screen that manages its own scrolling (a long list). */
  scroll?: boolean
}

/**
 * The frame every screen shares: a pinned header over a scrolling body, on the
 * app's own background.
 *
 * The horizontal gutter is NOT here. It belongs to the body, and several
 * screens need a full-bleed row inside it (a list whose dividers run edge to
 * edge), so each screen pads its own content.
 */
export function Screen({
  children,
  header,
  onRefresh,
  refreshing = false,
  scroll = true,
}: ScreenProps) {
  return (
    <View className="flex-1 bg-ink-bg">
      {header}

      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={ACCENT.DEFAULT}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1">{children}</View>
      )}
    </View>
  )
}
