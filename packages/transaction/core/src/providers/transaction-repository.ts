import { Transaction } from '../model'

/**
 * Transaction WRITE port (command side). `existsByCategory` is what the app
 * layer asks before letting a category be deleted (the CATEGORY_IN_USE rule
 * lives in `category`, the answer lives here).
 */
export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>
  create(transaction: Transaction): Promise<void>
  update(transaction: Transaction): Promise<void>
  delete(id: string): Promise<void>
  existsByCategory(categoryId: string): Promise<boolean>
}
