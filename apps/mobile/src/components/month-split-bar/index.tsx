import { Text, View } from 'react-native'
import { formatBRL } from 'ui'
import { MONTH_SPLIT_SEGMENTS, MONTH_SPLIT_SWATCHES } from './data/segments'

interface MonthSplitBarProps {
  /** Everything that came in — the whole the bar divides. */
  incomeCents: number
  /** The month's fixed bills (paid or still owed). */
  fixedCents: number
  /** Everything else that was spent. */
  variableCents: number
}

/**
 * The month in one bar: where the income went. The phone's copy of the web's,
 * sharing its `data/` so the three segments can never mean different things on
 * the two fronts — the colours are the product's SEMANTIC tokens used for
 * exactly what they mean, and each segment carries its own label and value, so
 * nothing is read by colour alone.
 *
 * A month in the red has nothing left to show as "sobra": the leftover segment
 * disappears and the two spending blocks fill the bar, which is the honest
 * picture.
 */
export function MonthSplitBar({ incomeCents, fixedCents, variableCents }: MonthSplitBarProps) {
  const leftoverCents = incomeCents - fixedCents - variableCents
  const values = {
    fixed: fixedCents,
    variable: variableCents,
    leftover: Math.max(leftoverCents, 0),
  }
  // Overspending is divided against what was actually spent, so the bar stays
  // full instead of overflowing its own track.
  const total = Math.max(incomeCents, fixedCents + variableCents)
  const shown = MONTH_SPLIT_SEGMENTS.filter((segment) => values[segment.key] > 0)

  if (total === 0) {
    return (
      <Text className="text-sm text-ink-text-soft">
        Cadastre sua renda para ver como o mês se divide.
      </Text>
    )
  }

  return (
    <View className="gap-3">
      <View className="h-4 flex-row gap-0.5 overflow-hidden rounded-full bg-ink-surface-soft">
        {shown.map((segment) => (
          <View
            key={segment.key}
            className={segment.className}
            style={{ width: `${(values[segment.key] / total) * 100}%` }}
          />
        ))}
      </View>

      <View className="gap-1.5">
        {MONTH_SPLIT_SEGMENTS.map((segment) => (
          <View key={segment.key} className="flex-row items-center gap-2">
            <View className={`h-2 w-2 rounded-full ${MONTH_SPLIT_SWATCHES[segment.key]}`} />
            <Text className="flex-1 text-xs text-ink-text-soft">{segment.label}</Text>
            <Text className="font-mono text-xs text-ink-text-muted">
              {formatBRL(segment.key === 'leftover' ? leftoverCents : values[segment.key])}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}
