import { BudgetDTO, BudgetUsageDTO, BudgetStatus, CategorySpent } from '../model'

/**
 * Pure domain service (no ports, no side effects): the single place that decides
 * how much of a ceiling is gone and what that means. The dashboard, the budget
 * screen and the alert the worker sends all go through here, so none of them can
 * call the same situation by a different name.
 */
export class BudgetUsageCalculator {
  /** Where "watch out" starts: 80% of the ceiling. Early enough to change
   * course, late enough not to cry wolf every month. */
  static readonly WARNING_RATIO = 0.8

  static calculate(budgets: BudgetDTO[], spending: CategorySpent[]): BudgetUsageDTO[] {
    const spentByCategory = new Map(
      spending.map((entry) => [entry.categoryId, entry.spentCents] as const),
    )

    return budgets
      .map((budget) =>
        BudgetUsageCalculator.evaluate(budget, spentByCategory.get(budget.categoryId) ?? 0),
      )
      .sort((left, right) => right.percentage - left.percentage)
  }

  /** Usage of a single ceiling. `spentCents` comes from the app layer. */
  static evaluate(budget: BudgetDTO, spentCents: number): BudgetUsageDTO {
    return {
      budgetId: budget.id,
      categoryId: budget.categoryId,
      limitCents: budget.amount,
      spentCents,
      remainingCents: budget.amount - spentCents,
      // Rounded to whole percent: it is a gauge, not an accounting figure, and
      // "83%" is what the screen shows.
      percentage: Math.round((spentCents / budget.amount) * 100),
      status: BudgetUsageCalculator.statusOf(budget.amount, spentCents),
    }
  }

  private static statusOf(limitCents: number, spentCents: number): BudgetStatus {
    if (spentCents >= limitCents) return 'exceeded'
    if (spentCents >= limitCents * BudgetUsageCalculator.WARNING_RATIO) return 'warning'
    return 'ok'
  }
}
