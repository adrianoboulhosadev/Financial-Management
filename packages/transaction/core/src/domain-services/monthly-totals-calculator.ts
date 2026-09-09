import { MonthlyTotalsDTO, CategoryTotalDTO } from '../model'

/** The only thing the calculator needs off a movement — so it works just as
 * well over entities, over read-model rows, and over the month's fixed
 * commitments, which are not rows at all yet. */
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
 *
 * COMMITMENTS (the month's fixed bills the worker has not posted yet) are kept
 * in their own totals rather than folded into `expenseCents`, and the split is
 * deliberate: `expenseCents`/`byCategory` are money that actually MOVED, which
 * is what a budget ceiling is measured against, while a commitment is money the
 * month already OWES. The dashboard leads with the two added up — that is what
 * makes "quanto sobra" honest halfway through the month — and the budget check
 * deliberately ignores them, so a ceiling is never reported as broken by a bill
 * nobody has paid.
 */
export class MonthlyTotalsCalculator {
  static calculate(movements: Countable[], commitments: Countable[] = []): MonthlyTotalsDTO {
    let incomeCents = 0
    let expenseCents = 0
    const spentByCategory = new Map<string | null, number>()

    for (const movement of movements) {
      if (movement.type === 'income') {
        incomeCents += movement.amount
        continue
      }
      expenseCents += movement.amount
      MonthlyTotalsCalculator.add(spentByCategory, movement.categoryId, movement.amount)
    }

    let committedIncomeCents = 0
    let committedExpenseCents = 0
    // Starts from what was really spent: the ranking on screen has to add up to
    // the number the screen leads with, which is spent + committed.
    const totalByCategory = new Map(spentByCategory)

    for (const commitment of commitments) {
      if (commitment.type === 'income') {
        committedIncomeCents += commitment.amount
        continue
      }
      committedExpenseCents += commitment.amount
      MonthlyTotalsCalculator.add(totalByCategory, commitment.categoryId, commitment.amount)
    }

    return {
      incomeCents,
      expenseCents,
      netCents: incomeCents - expenseCents,
      byCategory: MonthlyTotalsCalculator.sortedTotals(spentByCategory),
      totalByCategory: MonthlyTotalsCalculator.sortedTotals(totalByCategory),
      committedExpenseCents,
      committedIncomeCents,
    }
  }

  private static add(
    totals: Map<string | null, number>,
    categoryId: string | null,
    amount: number,
  ): void {
    totals.set(categoryId, (totals.get(categoryId) ?? 0) + amount)
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
