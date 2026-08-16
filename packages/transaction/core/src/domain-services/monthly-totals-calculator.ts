import { MonthlyTotalsDTO, CategoryTotalDTO } from '../model'

/** The only thing the calculator needs off a movement — so it works just as
 * well over entities as over read-model rows. */
export interface Countable {
  type: 'expense' | 'income'
  categoryId: string | null
  amount: number
}

/**
 * Pure domain service (no ports, no side effects): folds a month's movements
 * into the numbers every screen shows — total in, total out, what is left, and
 * how much each category consumed.
 *
 * It is the single place that says what "what is left" means, so the dashboard,
 * the report route and the budget usage can never disagree about it.
 */
export class MonthlyTotalsCalculator {
  static calculate(movements: Countable[]): MonthlyTotalsDTO {
    let incomeCents = 0
    let expenseCents = 0
    const spentByCategory = new Map<string | null, number>()

    for (const movement of movements) {
      if (movement.type === 'income') {
        incomeCents += movement.amount
        continue
      }
      expenseCents += movement.amount
      const current = spentByCategory.get(movement.categoryId) ?? 0
      spentByCategory.set(movement.categoryId, current + movement.amount)
    }

    return {
      incomeCents,
      expenseCents,
      netCents: incomeCents - expenseCents,
      byCategory: MonthlyTotalsCalculator.sortedTotals(spentByCategory),
    }
  }

  /** Biggest spender first — that is the order every screen wants — with the id
   * as a tie-break so the list never reshuffles between two equal categories. */
  private static sortedTotals(spentByCategory: Map<string | null, number>): CategoryTotalDTO[] {
    return [...spentByCategory.entries()]
      .map(([categoryId, spentCents]) => ({ categoryId, spentCents }))
      .sort((left, right) => {
        if (right.spentCents !== left.spentCents) return right.spentCents - left.spentCents
        return (left.categoryId ?? '').localeCompare(right.categoryId ?? '')
      })
  }
}
