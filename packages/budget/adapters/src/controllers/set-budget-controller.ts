import { SetBudget, BudgetRepository } from '@budget/core'
import { SetBudgetInput } from '../@types'

export default class SetBudgetController {
  constructor(private readonly repository: BudgetRepository) {}

  async execute(input: SetBudgetInput, ownerId: string, categoryIsLeaf?: boolean): Promise<void> {
    const useCase = new SetBudget(this.repository)
    await useCase.execute({ ownerId, ...input, categoryIsLeaf })
  }
}
