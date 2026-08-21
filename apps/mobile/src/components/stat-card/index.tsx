import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  accent?: 'positive' | 'negative' | 'accent' | 'none'
}

/** Same left rule as the web's card, so the three headline numbers are
 * distinguishable at a glance without colouring the whole surface. */
const ACCENT_CLASSES: Record<string, string> = {
  positive: 'border-l-positive',
  negative: 'border-l-negative',
  accent: 'border-l-accent',
  none: 'border-l-ink-border',
}

export function StatCard({ label, value, hint, accent = 'none' }: StatCardProps) {
  return (
    <View
      className={`rounded-card border border-l-4 border-ink-border bg-ink-surface p-4 ${ACCENT_CLASSES[accent]}`}
    >
      <Text className="text-xs font-medium uppercase tracking-wide text-ink-text-muted">
        {label}
      </Text>
      <View className="mt-2">{value}</View>
      {hint ? <Text className="mt-1 text-xs text-ink-text-muted">{hint}</Text> : null}
    </View>
  )
}
