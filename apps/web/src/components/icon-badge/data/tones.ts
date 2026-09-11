/** What the tile behind a row's icon is saying. Four tones, each tied to a
 * meaning the product already has — never a palette to tell rows apart. */
export type IconBadgeTone = 'accent' | 'income' | 'expense' | 'muted'

export const ICON_BADGE_TONES: Record<IconBadgeTone, { box: string; icon: string }> = {
  accent: { box: 'bg-accent-900', icon: 'text-accent-400' },
  income: { box: 'bg-positive/15', icon: 'text-positive' },
  expense: { box: 'bg-negative/15', icon: 'text-negative' },
  muted: { box: 'bg-ink-surface-soft', icon: 'text-neutral-500' },
}
