import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Kicker } from '@/components/kicker'
import { Pane } from '@/components/pane'
import type { IconProps } from '@/data/icons'
import { STAT_CARD_ICON_COLORS, type StatCardAccent } from './data/accents'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  accent?: StatCardAccent
  /** The glyph that says which direction the figure is — in, out, or neither. */
  icon?: (props: IconProps) => React.ReactNode
}

/**
 * A single figure with its name above and its caveat below — the same card the
 * web draws. The colour is carried by the NUMBER and the little icon beside the
 * label, not by a band around the card: two of these sit side by side on the
 * dashboard, and painting their edges would turn a pair of readings into a pair
 * of alerts.
 */
export function StatCard({ label, value, hint, accent = 'none', icon: Glyph }: StatCardProps) {
  return (
    <Pane className="flex-1 px-3.5 pb-4 pt-3.5">
      <View className="flex-row items-center gap-1.5">
        {Glyph ? <Glyph color={STAT_CARD_ICON_COLORS[accent]} size={13} /> : null}
        <Kicker>{label}</Kicker>
      </View>
      <View className="mt-2">{value}</View>
      {hint ? (
        <Text className="mt-1 text-[10.5px] leading-snug text-neutral-600">{hint}</Text>
      ) : null}
    </Pane>
  )
}
