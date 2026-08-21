/**
 * How an amount is coloured. `movement` reads the SIGN of the number itself (a
 * leftover, what is left of a ceiling); `expense`/`income` state the direction
 * explicitly, because a recorded amount is always a positive magnitude and only
 * the transaction's type says which way it went.
 */
export type AmountTone = 'movement' | 'expense' | 'income' | 'neutral'

export const TONE_CLASSES: Record<Exclude<AmountTone, 'movement'>, string> = {
  income: 'text-positive',
  expense: 'text-negative',
  neutral: 'text-ink-text',
}

/** Which side of a budget bar the user is on — the union itself belongs to the
 * domain (`BudgetStatus`), this only paints it. */
export const BUDGET_STATUS_CLASSES = {
  ok: 'bg-positive',
  warning: 'bg-warning',
  exceeded: 'bg-negative',
} as const
