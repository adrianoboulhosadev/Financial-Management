import { DeleteBudget, BudgetRepository } from '@budget/core'

export default class DeleteBudgetController {
  constructor(private readonly repository: BudgetRepository) {}

  async execute(budgetId: string, ownerId: string): Promise<void> {
    await new DeleteBudget(this.repository).execute({ ownerId, budgetId })
  }
}
