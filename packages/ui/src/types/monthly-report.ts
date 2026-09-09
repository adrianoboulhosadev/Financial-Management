import type { CategoryTotalDTO } from '@transaction/adapters'
import type { BudgetUsageDTO } from '@budget/adapters'

/**
 * Mirrors the composed shape GET /report/monthly returns. It is hand-written
 * because the shape belongs to NO context — the backend assembles it from three
 * of them — so there is no adapters package to import it from. The parts that
 * DO belong to a context are imported, not re-declared.
 *
 * It lives here, and not in one of the apps, because both of them read it.
 */
export interface MonthlyReport {
  period: string
  plannedIncomeCents: number
  realizedIncomeCents: number
  /** Expenses that actually MOVED. */
  expenseCents: number
  /** The month's fixed bills not posted yet — money it already owes. */
  committedExpenseCents: number
  /** expenses + commitments: what the dashboard shows as "saiu". */
  totalExpenseCents: number
  /** What already went into investments this month — off the leftover, because
   * it left the account on purpose. */
  investedCents: number
  leftoverCents: number
  /** Money that moved, per category — what the ceilings are measured against. */
  byCategory: CategoryTotalDTO[]
  /** The same split with the unpaid fixed bills folded in — what the charts
   * rank, so the ranking adds up to `totalExpenseCents`. */
  totalByCategory: CategoryTotalDTO[]
  budgets: BudgetUsageDTO[]
}
