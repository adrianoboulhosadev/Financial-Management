import { UseCase } from 'shared'
import { BudgetUsageDTO } from '../model'
import { BudgetUsageCalculator } from '../domain-services'
import { BudgetQueryRepository } from '../providers'

interface Input {
  ownerId: string
  categoryId: string
  /** What that category has consumed in the month being checked — resolved by
   * the worker from the `transaction` context. */
  spentCents: number
}

/**
 * Decides whether spending on a category is now worth telling its owner about.
 * The worker runs it off the budget-check queue; it answers the usage when the
 * ceiling is at the warning threshold or blown, and NULL when everything is
 * still fine — so "no news" needs no special code path at the caller.
 *
 * It writes nothing: turning the answer into an inbox line is the app layer's
 * job (and the notification's own unique key is what stops the same crossing
 * from being announced twice).
 */
export default class EvaluateBudgetAlert implements UseCase<Input, BudgetUsageDTO | null> {
  constructor(private readonly queryRepository: BudgetQueryRepository) {}

  async execute({ ownerId, categoryId, spentCents }: Input): Promise<BudgetUsageDTO | null> {
    const budget = await this.queryRepository.findByCategoryQuery(ownerId, categoryId)
    // No ceiling on this category: nothing was ever promised, so nothing broke.
    if (!budget) return null

    const usage = BudgetUsageCalculator.evaluate(budget, spentCents)
    return usage.status === 'ok' ? null : usage
  }
}
