import { Transaction } from '../model'

/**
 * Transaction WRITE port (command side). `existsByCategory` is what the app
 * layer asks before letting a category be deleted (the CATEGORY_IN_USE rule
 * lives in `category`, the answer lives here); `existsByBank`/`existsByCard`
 * answer the same question for the `bank` context.
 *
 * `createMany` exists for the one case a single `create` cannot serve: a credit
 * purchase split over N months is ONE decision that has to leave N rows or
 * none, so the adapter writes them together instead of the use case looping and
 * risking a half-recorded purchase.
 */
export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>
  create(transaction: Transaction): Promise<void>
  createMany(transactions: Transaction[]): Promise<void>
  update(transaction: Transaction): Promise<void>
  delete(id: string): Promise<void>
  existsByCategory(categoryId: string): Promise<boolean>
  existsByBank(bankId: string): Promise<boolean>
  existsByCard(cardId: string): Promise<boolean>
}
