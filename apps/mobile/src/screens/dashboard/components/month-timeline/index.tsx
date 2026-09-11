import { Text, View } from 'react-native'
import type { TransactionDTO } from '@transaction/adapters'
import { formatDayHeading, type DayGroup } from 'ui'
import { Amount } from '@/components/amount'
import { EmptyState } from '@/components/empty-state'

interface MonthTimelineProps {
  days: DayGroup<TransactionDTO>[]
  captionFor: (transaction: TransactionDTO) => string
}

/**
 * The month as it actually happened, newest first, hung off a single rail —
 * the same shape as the web's.
 *
 * The rail earns its ink: it is what turns a flat list into a sequence, so the
 * gaps between days read as time rather than as padding. Only the most recent
 * day gets a filled node — it is "where you are", and marking every day would
 * make the marker mean nothing.
 */
export function MonthTimeline({ days, captionFor }: MonthTimelineProps) {
  if (days.length === 0) {
    return (
      <EmptyState
        title="Nada lançado neste mês"
        description="Assim que você registrar um gasto ou uma entrada, o mês aparece aqui dia a dia."
      />
    )
  }

  return (
    <View className="flex-row gap-3.5">
      <View className="ml-[5px] w-0.5 rounded-full bg-ink-border" />

      <View className="-ml-[21px] flex-1 gap-5">
        {days.map((day, index) => {
          const netCents = day.items.reduce(
            (sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount),
            0,
          )

          return (
            <View key={day.day}>
              <View className="flex-row items-center gap-3">
                {/* The ring is a second, larger circle behind the node rather
                    than a shadow: React Native has no `box-shadow` spread to
                    draw one with. */}
                <View
                  className={`h-3 w-3 items-center justify-center rounded-full ${
                    index === 0 ? 'bg-accent' : 'bg-neutral-700'
                  }`}
                >
                  <View
                    className={`h-1.5 w-1.5 rounded-full ${
                      index === 0 ? 'bg-accent' : 'bg-ink-bg'
                    }`}
                  />
                </View>

                <Text
                  className={`text-xs font-medium capitalize ${
                    index === 0 ? 'text-ink-text' : 'text-neutral-400'
                  }`}
                >
                  {formatDayHeading(day.date)}
                </Text>
                <Amount cents={netCents} signed tone="muted" className="text-[11px]" />
              </View>

              <View className="ml-[26px] mt-2.5 gap-2.5">
                {day.items.map((transaction) => (
                  <View key={transaction.id} className="flex-row items-baseline gap-2.5">
                    <View className="flex-1">
                      <Text numberOfLines={1} className="text-[13px] text-ink-text">
                        {transaction.description}
                      </Text>
                      <Text numberOfLines={1} className="mt-0.5 text-[11px] text-neutral-600">
                        {captionFor(transaction)}
                      </Text>
                    </View>
                    <Amount
                      cents={transaction.amount}
                      tone={transaction.type === 'income' ? 'income' : 'expense'}
                      signed
                      className="text-[13px]"
                    />
                  </View>
                ))}
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
