/** READ projection (CQRS) of a ceiling. Plain interface — no entity, no VOs. */
export interface BudgetDTO {
  id: string
  ownerId: string
  categoryId: string
  // INTEGER CENTS.
  amount: number
}

/**
 * How close a ceiling is to being used up in a given month.
 *
 * - `ok`: still comfortably inside the plan;
 * - `warning`: at or past the warning threshold (see BudgetUsageCalculator);
 * - `exceeded`: spent everything and then some.
 *
 * `remainingCents` is deliberately a plain number, not Money: once the ceiling
 * is blown it goes NEGATIVE, and "how much over" is exactly what the owner needs
 * to see.
 */
export type BudgetStatus = 'ok' | 'warning' | 'exceeded'

export interface BudgetUsageDTO {
  budgetId: string
  categoryId: string
  limitCents: number
  spentCents: number
  remainingCents: number
  // Whole percent of the ceiling already used (may go past 100).
  percentage: number
  status: BudgetStatus
}

/** What a category consumed in the month — handed in by the APP layer, which is
 * the only one allowed to ask the `transaction` context. */
export interface CategorySpent {
  categoryId: string
  spentCents: number
}
