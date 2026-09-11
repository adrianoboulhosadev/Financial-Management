import { Modal, Pressable, Text, View } from 'react-native'
import { formatPeriodShort, INK, monthsOfYear, NEUTRAL } from 'ui'
import { CaretLeftIcon, CaretRightIcon } from '@/data/icons'
import { useMonthPicker } from './hooks/use-month-picker'

interface MonthPickerProps {
  // "YYYY-MM" — the same shape the API's MonthPeriod speaks.
  period: string
  onChange: (period: string) => void
}

/**
 * Walks the reports one month at a time, or jumps straight to one. Deliberately
 * dumb about the DATA (no state but its own sheet): whoever owns the screen owns
 * the period, because several queries key off it.
 *
 * The pill is tappable, not just a label. Stepping with the arrows is right for
 * "last month"; reaching a month a year back that way is eleven taps, which is
 * why the label opens a year-and-month grid.
 *
 * Both ways are bounded by the account's own window (see `useMonthRange`) —
 * there is nothing recorded before the account existed or after today.
 */
export function MonthPicker({ period, onChange }: MonthPickerProps) {
  const picker = useMonthPicker(period, onChange)

  return (
    <>
      <View className="mt-3 flex-row items-center justify-between rounded-full bg-ink-surface px-3.5 py-2">
        <Pressable
          accessibilityLabel="Mês anterior"
          accessibilityRole="button"
          hitSlop={10}
          disabled={!picker.canGoBack}
          onPress={picker.goBack}
        >
          <CaretLeftIcon
            color={picker.canGoBack ? NEUTRAL[500] : INK['border-strong']}
            size={14}
          />
        </Pressable>

        <Pressable onPress={picker.show} accessibilityRole="button" hitSlop={8}>
          <Text className="text-[13px] font-medium capitalize text-ink-text">
            {formatPeriodShort(period)}
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Próximo mês"
          accessibilityRole="button"
          hitSlop={10}
          // Stops at the current month: there is nothing recorded in the future.
          // Disabled it greys to the card outline rather than disappearing, so
          // the pill stays symmetrical and the control stays findable.
          disabled={!picker.canGoForward}
          onPress={picker.goForward}
        >
          <CaretRightIcon
            color={picker.canGoForward ? NEUTRAL[500] : INK['border-strong']}
            size={14}
          />
        </Pressable>
      </View>

      <Modal visible={picker.open} transparent animationType="slide" onRequestClose={picker.close}>
        <Pressable className="flex-1 justify-end bg-ink-bg/70" onPress={picker.close}>
          <Pressable
            className="rounded-t-[20px] border-t border-ink-border-strong bg-ink-surface p-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-4 text-[15px] font-medium text-ink-text">Escolher mês</Text>

            <View className="mb-3 flex-row items-center justify-between px-1">
              <Pressable
                accessibilityLabel="Ano anterior"
                hitSlop={10}
                disabled={!picker.canPreviousYear}
                onPress={picker.previousYear}
              >
                <CaretLeftIcon
                  color={picker.canPreviousYear ? NEUTRAL[500] : INK['border-strong']}
                  size={16}
                />
              </Pressable>

              <Text className="text-[14px] font-medium text-ink-text">{picker.year}</Text>

              <Pressable
                accessibilityLabel="Próximo ano"
                hitSlop={10}
                disabled={!picker.canNextYear}
                onPress={picker.nextYear}
              >
                <CaretRightIcon
                  color={picker.canNextYear ? NEUTRAL[500] : INK['border-strong']}
                  size={16}
                />
              </Pressable>
            </View>

            <View className="flex-row flex-wrap">
              {monthsOfYear(picker.year).map((option) => {
                const selected = option.period === period
                const selectable = picker.isSelectable(option.period)

                return (
                  <View key={option.period} className="w-1/3 p-1">
                    <Pressable
                      disabled={!selectable}
                      onPress={() => picker.select(option.period)}
                      accessibilityState={{ selected, disabled: !selectable }}
                      className={`rounded-field py-2.5 active:opacity-70 ${
                        selected ? 'bg-accent-900' : ''
                      }`}
                    >
                      <Text
                        className={`text-center text-[12px] capitalize ${
                          selected
                            ? 'text-accent-200'
                            : selectable
                              ? 'text-neutral-400'
                              : 'text-neutral-700'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  </View>
                )
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}
