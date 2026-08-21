import { Text, View } from 'react-native'

interface EmptyStateProps {
  title: string
  description?: string
}

/** What a list shows before it has anything in it — always says what to do
 * next, never just "sem dados". */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="rounded-card border border-dashed border-ink-border px-6 py-10">
      <Text className="text-center font-medium text-ink-text">{title}</Text>
      {description ? (
        <Text className="mt-1 text-center text-sm text-ink-text-soft">{description}</Text>
      ) : null}
    </View>
  )
}
