import { EvaluateBudgetAlert, BudgetQueryRepository, BudgetUsageDTO } from '@budget/core'

/** System entry point — the worker calls it off the budget-check queue. */
export default class EvaluateBudgetAlertController {
  constructor(private readonly queryRepository: BudgetQueryRepository) {}

  async execute(
    ownerId: string,
    categoryId: string,
    spentCents: number,
  ): Promise<BudgetUsageDTO | null> {
    return new EvaluateBudgetAlert(this.queryRepository).execute({
      ownerId,
      categoryId,
      spentCents,
    })
  }
}
