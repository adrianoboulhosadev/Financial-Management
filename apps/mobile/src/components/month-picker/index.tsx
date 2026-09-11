import { Pressable, Text, View } from 'react-native'
import { formatPeriodShort, INK, NEUTRAL, shiftPeriod, toPeriod } from 'ui'
import { CaretLeftIcon, CaretRightIcon } from '@/data/icons'

interface MonthPickerProps {
  // "YYYY-MM" — the same shape the API's MonthPeriod speaks.
  period: string
  onChange: (period: string) => void
}

/**
 * Walks the reports one month at a time. Deliberately dumb (no state of its
 * own): whoever owns the screen owns the period, because several queries key
 * off it.
 *
 * A full-width pill with the month centred between two carets — the same shape
 * the web draws, which is what makes the month read as the screen's context
 * rather than as one more control.
 */
export function MonthPicker({ period, onChange }: MonthPickerProps) {
  const atCurrent = period >= toPeriod()

  return (
    <View className="mt-3 flex-row items-center justify-between rounded-full bg-ink-surface px-3.5 py-2">
      <Pressable
        accessibilityLabel="Mês anterior"
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => onChange(shiftPeriod(period, -1))}
      >
        <CaretLeftIcon color={NEUTRAL[500]} size={14} />
      </Pressable>

      <Text className="text-[13px] font-medium capitalize text-ink-text">
        {formatPeriodShort(period)}
      </Text>

      <Pressable
        accessibilityLabel="Próximo mês"
        accessibilityRole="button"
        hitSlop={10}
        // Stops at the current month: there is nothing recorded in the future.
        // Disabled it greys to the card outline rather than disappearing, so the
        // pill stays symmetrical and the control stays findable.
        disabled={atCurrent}
        onPress={() => onChange(shiftPeriod(period, 1))}
      >
        <CaretRightIcon color={atCurrent ? INK['border-strong'] : NEUTRAL[500]} size={14} />
      </Pressable>
    </View>
  )
}
