import type { NotificationType } from '@notification/adapters'
import type { IconBadgeTone } from '@/components/icon-badge/data/tones'
import type { IconProps } from '@/data/icons'
import { CalendarCheckIcon, WarningIcon } from '@/data/icons'

/**
 * What each kind of news looks like in the inbox — the SAME glyph and tone as
 * the web's table. Mapped from the DOMAIN's own union, so adding a notification
 * type fails the build here instead of quietly rendering an untinted, iconless
 * row.
 */
export const NOTIFICATION_TYPE_ICONS: Record<
  NotificationType,
  { icon: (props: IconProps) => React.ReactNode; tone: IconBadgeTone }
> = {
  budget_warning: { icon: WarningIcon, tone: 'accent' },
  budget_exceeded: { icon: WarningIcon, tone: 'expense' },
  recurrence_posted: { icon: CalendarCheckIcon, tone: 'accent' },
}
