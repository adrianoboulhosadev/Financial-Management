import { Text, View } from 'react-native'

export interface MonthBar {
  /** "YYYY-MM". */
  period: string
  cents: number
}

interface MonthBarsProps {
  bars: MonthBar[]
  height?: number
}

/** Three letters is the whole label a month needs when the bars are six across
 * and the reader is looking for a shape, not a date. */
function shortMonth(period: string): string {
  const [year, month] = period.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1))
    .toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })
    .replace('.', '')
}

/**
 * A few months side by side, scaled to the tallest of them — the same chart the
 * web draws. Bars and not a line because there are six discrete months, not a
 * continuum, and the question is "which is taller".
 *
 * The bars and their labels are two rows rather than six little columns: a
 * percentage height only resolves against a parent with a DEFINITE height, and
 * a column that also has to fit a caption does not have one.
 */
export function MonthBars({ bars, height = 74 }: MonthBarsProps) {
  const peak = Math.max(...bars.map((bar) => bar.cents), 1)

  return (
    <View>
      <View className="flex-row items-end gap-[7px]" style={{ height }}>
        {bars.map((bar, index) => (
          <View
            key={bar.period}
            className={`flex-1 rounded-[3px] ${
              index === bars.length - 1 ? 'bg-accent' : 'bg-accent-800'
            }`}
            // A floor of 2% so a month with nothing in it still shows a mark
            // instead of a gap that reads as missing data.
            style={{ height: `${Math.max((bar.cents / peak) * 100, 2)}%` }}
          />
        ))}
      </View>

      <View className="mt-1.5 flex-row gap-[7px]">
        {bars.map((bar, index) => (
          <Text
            key={bar.period}
            className={`flex-1 text-center text-[9.5px] capitalize ${
              index === bars.length - 1 ? 'text-accent-300' : 'text-neutral-600'
            }`}
          >
            {shortMonth(bar.period)}
          </Text>
        ))}
      </View>
    </View>
  )
}
