import { UseCase, NotFoundError, Errors } from 'shared'
import { BudgetRepository } from '../providers'

interface Input {
  ownerId: string
  budgetId: string
}

/** Removes a ceiling — the category stays, it just stops being watched. */
export default class DeleteBudget implements UseCase<Input, void> {
  constructor(private readonly repository: BudgetRepository) {}

  async execute({ ownerId, budgetId }: Input): Promise<void> {
    const budget = await this.repository.findById(budgetId)
    // Someone else's ceiling is indistinguishable from a missing one (anti-IDOR).
    if (!budget || !budget.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.BUDGET_NOT_FOUND, budgetId)
    }

    await this.repository.delete(budgetId)
  }
}
