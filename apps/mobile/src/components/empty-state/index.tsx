import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

/** What a list shows before it has anything in it — always says what to do
 * next, never just "sem dados". */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View className="rounded-card border border-dashed border-ink-border-strong px-6 py-10">
      <Text className="text-center text-[13px] font-medium text-ink-text">{title}</Text>
      {description ? (
        <Text className="mt-1.5 text-center text-[11.5px] leading-relaxed text-neutral-600">
          {description}
        </Text>
      ) : null}
      {action ? <View className="mt-4">{action}</View> : null}
    </View>
  )
}
