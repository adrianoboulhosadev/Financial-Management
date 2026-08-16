import type { CategoryTotalDTO } from '@transaction/adapters'
import type { BudgetUsageDTO } from '@budget/adapters'

/**
 * Mirrors the composed shape GET /report/monthly returns. It is hand-written
 * because the shape belongs to NO context — the backend assembles it from three
 * of them — so there is no adapters package to import it from. The parts that
 * DO belong to a context are imported, not re-declared.
 */
export interface MonthlyReport {
  period: string
  plannedIncomeCents: number
  realizedIncomeCents: number
  expenseCents: number
  leftoverCents: number
  byCategory: CategoryTotalDTO[]
  budgets: BudgetUsageDTO[]
}
