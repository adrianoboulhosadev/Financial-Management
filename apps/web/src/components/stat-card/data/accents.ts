/** Which of the product's three money meanings the figure is. `none` is for a
 * total that is neither an inflow nor an outflow — a balance, a portfolio. */
export type StatCardAccent = 'positive' | 'negative' | 'accent' | 'none'

export const STAT_CARD_TONES: Record<StatCardAccent, string> = {
  positive: 'text-positive',
  negative: 'text-negative',
  accent: 'text-accent-400',
  none: 'text-ink-text',
}
