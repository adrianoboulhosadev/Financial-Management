import { UseCase, ValidationError, Errors } from 'shared'
import { Budget } from '../model'
import { BudgetRepository } from '../providers'

interface Input {
  ownerId: string
  categoryId: string
  amount: number
  /** Whether the category exists, belongs to this user AND is a leaf — resolved
   * by the APP layer (`budget` never imports `category`). */
  categoryIsLeaf?: boolean
}

/**
 * Defines the ceiling for a category, or adjusts the one already there. A single
 * use case for both because from the owner's point of view there is one ceiling
 * per category and they are setting it — whether a row existed before is
 * storage's business, not theirs.
 */
export default class SetBudget implements UseCase<Input, void> {
  constructor(private readonly repository: BudgetRepository) {}

  async execute({ ownerId, categoryId, amount, categoryIsLeaf }: Input): Promise<void> {
    // A ceiling belongs on the same node the spending lands on; budgeting a
    // branch would double count every child underneath it.
    if (categoryIsLeaf === false) ValidationError.throwError(Errors.CATEGORY_NOT_LEAF, categoryId)

    const existing = await this.repository.findByCategory(ownerId, categoryId)
    if (existing) {
      existing.changeAmount(amount)
      await this.repository.update(existing)
      return
    }

    await this.repository.create(new Budget({ ownerId, categoryId, amount }))
  }
}
