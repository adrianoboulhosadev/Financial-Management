import { ACCENT, INK, SEMANTIC } from 'ui'

/** Which of the product's three money meanings the figure is. `none` is for a
 * total that is neither an inflow nor an outflow — a balance, a portfolio. */
export type StatCardAccent = 'positive' | 'negative' | 'accent' | 'none'

export const STAT_CARD_TONES: Record<StatCardAccent, string> = {
  positive: 'text-positive',
  negative: 'text-negative',
  accent: 'text-accent-400',
  none: 'text-ink-text',
}

/** The same four tones as VALUES, for the icon — React Native has no cascade
 * for a glyph to inherit a colour through. */
export const STAT_CARD_ICON_COLORS: Record<StatCardAccent, string> = {
  positive: SEMANTIC.positive,
  negative: SEMANTIC.negative,
  accent: ACCENT[400],
  none: INK.text,
}
