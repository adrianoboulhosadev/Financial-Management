import { UseCase } from 'shared'
import { BudgetUsageDTO, CategorySpent } from '../model'
import { BudgetUsageCalculator } from '../domain-services'
import { BudgetQueryRepository } from '../providers'

interface Input {
  ownerId: string
  /** What each category consumed in the month, handed in by the APP layer (it
   * is the one that may ask the `transaction` context). */
  spending: CategorySpent[]
}

/**
 * Read side (CQRS): every ceiling with how much of it the month already ate.
 * The arithmetic and the naming of each situation belong to the
 * BudgetUsageCalculator domain service; this use case only wires it to the
 * spending the app resolved.
 */
export default class GetMyBudgetUsageQuery implements UseCase<Input, BudgetUsageDTO[]> {
  constructor(private readonly queryRepository: BudgetQueryRepository) {}

  async execute({ ownerId, spending }: Input): Promise<BudgetUsageDTO[]> {
    const budgets = await this.queryRepository.listByOwnerQuery(ownerId)
    return BudgetUsageCalculator.calculate(budgets, spending)
  }
}
