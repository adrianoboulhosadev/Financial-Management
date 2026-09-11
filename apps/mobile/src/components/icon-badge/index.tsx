import { View } from 'react-native'
import type { IconProps } from '@/data/icons'
import { ICON_BADGE_TONES, type IconBadgeTone } from './data/tones'

interface IconBadgeProps {
  /** The glyph component itself, not an element: the badge owns the colour, and
   * on React Native colour is a PROP rather than something the tile can pass
   * down through the cascade. */
  icon: (props: IconProps) => React.ReactNode
  tone?: IconBadgeTone
}

/** The rounded square an icon sits in at the head of a list row. The tint is
 * the row's subject, never decoration. */
export function IconBadge({ icon: Glyph, tone = 'accent' }: IconBadgeProps) {
  const { box, icon } = ICON_BADGE_TONES[tone]

  return (
    <View className={`h-[34px] w-[34px] items-center justify-center rounded-lg ${box}`}>
      <Glyph color={icon} size={17} />
    </View>
  )
}
