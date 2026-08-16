import { Budget } from '../model'

/**
 * Budget WRITE port (command side). `findByCategory` is what makes setting a
 * ceiling an upsert from the caller's point of view — there is only ever one row
 * per (owner, category). `existsByCategory` answers the app layer when it checks
 * whether a category can still be deleted.
 */
export interface BudgetRepository {
  findById(id: string): Promise<Budget | null>
  findByCategory(ownerId: string, categoryId: string): Promise<Budget | null>
  create(budget: Budget): Promise<void>
  update(budget: Budget): Promise<void>
  delete(id: string): Promise<void>
  existsByCategory(categoryId: string): Promise<boolean>
}
