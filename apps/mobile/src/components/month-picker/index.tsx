import { Pressable, Text, View } from 'react-native'
import { formatPeriod, shiftPeriod, toPeriod } from 'ui'

interface MonthPickerProps {
  // "YYYY-MM" — the same shape the API's MonthPeriod speaks.
  period: string
  onChange: (period: string) => void
}

/** Walks the reports one month at a time. Deliberately dumb (no state of its
 * own): whoever owns the screen owns the period, because several queries key
 * off it. */
export function MonthPicker({ period, onChange }: MonthPickerProps) {
  const current = toPeriod()
  const atCurrent = period >= current

  return (
    <View className="flex-row items-center justify-between rounded-lg border border-ink-border bg-ink-surface p-1">
      <Pressable
        accessibilityLabel="Mês anterior"
        onPress={() => onChange(shiftPeriod(period, -1))}
        className="px-4 py-1.5"
      >
        <Text className="text-lg text-ink-text-soft">‹</Text>
      </Pressable>
      <Text className="text-sm font-medium capitalize text-ink-text">{formatPeriod(period)}</Text>
      <Pressable
        accessibilityLabel="Próximo mês"
        // Stops at the current month: there is nothing recorded in the future.
        disabled={atCurrent}
        onPress={() => onChange(shiftPeriod(period, 1))}
        className={`px-4 py-1.5 ${atCurrent ? 'opacity-30' : ''}`}
      >
        <Text className="text-lg text-ink-text-soft">›</Text>
      </Pressable>
    </View>
  )
}
