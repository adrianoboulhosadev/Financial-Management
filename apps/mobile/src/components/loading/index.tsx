import { ActivityIndicator, Text, View } from 'react-native'

interface LoadingProps {
  /** For the auth guards, which render before any chrome exists — Loading IS
   * the screen at that moment, so it claims the whole viewport. */
  fullScreen?: boolean
  /** For a loading state inside an already-rendered screen (a card, a list
   * slot). Claims no height of its own. */
  compact?: boolean
}

/**
 * Same three sizes as the web's, for the same three situations — a phone has
 * the same problem of a spinner claiming either too much room or too little.
 */
export function Loading({ fullScreen = false, compact = false }: LoadingProps) {
  return (
    <View
      className={`items-center justify-center gap-3 ${
        fullScreen ? 'flex-1 bg-ink-bg' : compact ? 'py-8' : 'flex-1 py-16'
      }`}
    >
      <ActivityIndicator color="#4f9cf9" />
      <Text className={`text-ink-text-muted ${compact ? 'text-xs' : 'text-sm'}`}>Carregando…</Text>
    </View>
  )
}
