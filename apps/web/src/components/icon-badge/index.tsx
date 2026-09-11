import type { ReactNode } from 'react'
import { ICON_BADGE_TONES, type IconBadgeTone } from './data/tones'

interface IconBadgeProps {
  children: ReactNode
  tone?: IconBadgeTone
}

/**
 * The rounded square an icon sits in at the head of a list row. The tint is the
 * row's SUBJECT, not decoration: money arriving is green-backed, a warning is
 * red-backed, and everything else takes the neutral accent tile — so a list can
 * be skimmed for the one row that is different.
 */
export function IconBadge({ children, tone = 'accent' }: IconBadgeProps) {
  const { box, icon } = ICON_BADGE_TONES[tone]

  return (
    <span className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg ${box}`}>
      <span className={icon}>{children}</span>
    </span>
  )
}
