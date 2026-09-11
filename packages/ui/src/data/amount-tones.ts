/**
 * How an amount is coloured. `movement` reads the SIGN of the number itself (a
 * leftover, what is left of a ceiling); `expense`/`income` state the direction
 * explicitly, because a recorded amount is always a positive magnitude and only
 * the transaction's type says which way it went.
 */
export type AmountTone = 'movement' | 'expense' | 'income' | 'neutral' | 'muted' | 'committed'

export const TONE_CLASSES: Record<Exclude<AmountTone, 'movement'>, string> = {
  income: 'text-positive',
  expense: 'text-negative',
  neutral: 'text-ink-text',
  /** Settled, or simply not the figure being compared — still legible, no longer loud. */
  muted: 'text-neutral-500',
  /** Owed but not yet paid: the month's estimate, not money that moved. */
  committed: 'text-warning',
}

/** Which side of a budget bar the user is on — the union itself belongs to the
 * domain (`BudgetStatus`), this only paints it. */
export const BUDGET_STATUS_CLASSES = {
  ok: 'bg-positive',
  warning: 'bg-warning',
  exceeded: 'bg-negative',
} as const

/** The same three states as text, for the percentage that labels the bar. */
export const BUDGET_STATUS_TEXT_CLASSES = {
  ok: 'text-neutral-600',
  warning: 'text-warning',
  exceeded: 'text-negative',
} as const
