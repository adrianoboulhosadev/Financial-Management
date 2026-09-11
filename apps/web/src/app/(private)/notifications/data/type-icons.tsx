import type { NotificationType } from '@notification/adapters'
import type { ReactNode } from 'react'
import type { IconBadgeTone } from '@/components/icon-badge/data/tones'
import { CalendarCheckIcon, WarningIcon } from '@/data/icons'

/**
 * What each kind of news looks like in the inbox. Mapped from the DOMAIN's own
 * union, so adding a notification type fails the build here instead of quietly
 * rendering an untinted, iconless row.
 *
 * The tone is the news, not decoration: a blown ceiling is red-backed and a
 * posted bill is the neutral accent tile.
 */
export const NOTIFICATION_TYPE_ICONS: Record<
  NotificationType,
  { icon: ReactNode; tone: IconBadgeTone }
> = {
  budget_warning: { icon: <WarningIcon size={17} />, tone: 'accent' },
  budget_exceeded: { icon: <WarningIcon size={17} />, tone: 'expense' },
  recurrence_posted: { icon: <CalendarCheckIcon size={17} />, tone: 'accent' },
}
