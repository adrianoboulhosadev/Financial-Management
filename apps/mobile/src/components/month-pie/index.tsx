import { Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { formatBRL, INK, PIE_VIEWBOX, wedgePath } from 'ui'
import { MONTH_SLICES, type MonthSliceKey } from './data/slices'

interface MonthPieProps {
  /** Everything that came in — the whole the pie divides. */
  incomeCents: number
  /** The month's fixed bills (paid or still owed). */
  fixedCents: number
  /** Everything else that was spent. */
  variableCents: number
}

/**
 * The month as one circle — the SAME arithmetic and the same shared geometry as
 * the web's `<MonthPie>`, so the two apps cannot end up telling different
 * stories about one month.
 *
 * Each share carries its own label, value and percentage beside it: nothing
 * here is read by colour alone.
 */
export function MonthPie({ incomeCents, fixedCents, variableCents }: MonthPieProps) {
  const leftoverCents = incomeCents - fixedCents - variableCents
  const values: Record<MonthSliceKey, number> = {
    fixed: fixedCents,
    variable: variableCents,
    leftover: Math.max(leftoverCents, 0),
  }
  // Overspending is divided against what was actually spent, so the circle
  // stays a circle instead of a share overflowing it.
  const total = Math.max(incomeCents, fixedCents + variableCents)

  if (total === 0) {
    return (
      <Text className="text-[11.5px] text-neutral-600">
        Cadastre sua renda para ver como o mês se divide.
      </Text>
    )
  }

  let cursor = 0
  const wedges = MONTH_SLICES.filter((slice) => values[slice.key] > 0).map((slice) => {
    const size = values[slice.key] / total
    const d = wedgePath(cursor, size)
    cursor += size
    return { ...slice, d }
  })

  return (
    <View className="flex-row items-center gap-5">
      <Svg width={128} height={128} viewBox={`0 0 ${PIE_VIEWBOX} ${PIE_VIEWBOX}`}>
        {wedges.map((wedge) => (
          <Path
            key={wedge.key}
            d={wedge.d}
            fill={wedge.fill}
            stroke={INK.surface}
            strokeWidth={2}
          />
        ))}
      </Svg>

      <View className="flex-1 gap-3.5">
        {MONTH_SLICES.map((slice) => (
          <View key={slice.key} className="flex-row items-center gap-2.5">
            <View className={`h-2 w-2 rounded-sm ${slice.swatch}`} />
            <View className="flex-1">
              <Text className="text-[11.5px] text-neutral-500">{slice.label}</Text>
              <Text className="mt-0.5 text-[13.5px] text-ink-text">
                {/* The leftover keeps its SIGN: a month in the red shows a
                    negative sobra rather than a zero it does not have. */}
                {formatBRL(slice.key === 'leftover' ? leftoverCents : values[slice.key])}
              </Text>
            </View>
            <Text className="text-[11px] text-neutral-600">
              {Math.round((values[slice.key] / total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}
