import { ACCENT, NEUTRAL, SEMANTIC } from 'ui'

/** What the tile behind a row's icon is saying. Four tones, each tied to a
 * meaning the product already has — never a palette to tell rows apart.
 *
 * The icon colour is a VALUE and not a class: React Native has no CSS
 * inheritance, so a glyph cannot pick `currentColor` up from the tile. */
export type IconBadgeTone = 'accent' | 'income' | 'expense' | 'muted'

export const ICON_BADGE_TONES: Record<IconBadgeTone, { box: string; icon: string }> = {
  accent: { box: 'bg-accent-900', icon: ACCENT[400] },
  income: { box: 'bg-positive/15', icon: SEMANTIC.positive },
  expense: { box: 'bg-negative/15', icon: SEMANTIC.negative },
  muted: { box: 'bg-ink-surface-soft', icon: NEUTRAL[500] },
}
