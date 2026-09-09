import { UseCase } from 'shared'
import { Budget } from '../model'
import { BudgetRepository } from '../providers'

interface Input {
  ownerId: string
  categoryId: string
  amount: number
}

/**
 * Defines the ceiling for a category, or adjusts the one already there. A single
 * use case for both because from the owner's point of view there is one ceiling
 * per category and they are setting it — whether a row existed before is
 * storage's business, not theirs.
 *
 * ANY node of the tree can hold a ceiling, branch or leaf: how deep the owner
 * files their money is their call, and the ceiling has to be able to sit
 * wherever the spending does. Whether the category exists and belongs to this
 * user is the APP layer's check, made before this runs.
 */
export default class SetBudget implements UseCase<Input, void> {
  constructor(private readonly repository: BudgetRepository) {}

  async execute({ ownerId, categoryId, amount }: Input): Promise<void> {
    const existing = await this.repository.findByCategory(ownerId, categoryId)
    if (existing) {
      existing.changeAmount(amount)
      await this.repository.update(existing)
      return
    }

    await this.repository.create(new Budget({ ownerId, categoryId, amount }))
  }
}
