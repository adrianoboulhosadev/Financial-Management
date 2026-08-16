import { TransactionDTO } from '../model'

/** Window + filters of a listing. `from` is inclusive and `to` EXCLUSIVE — the
 * same [start, end) shape MonthPeriod produces, which is what keeps the last day
 * of a month from being cut off. */
export interface TransactionFilter {
  from?: Date
  to?: Date
  type?: 'expense' | 'income'
  categoryId?: string
}

/** Transaction READ port (query side of CQRS). */
export interface TransactionQueryRepository {
  listByOwnerQuery(ownerId: string, filter?: TransactionFilter): Promise<TransactionDTO[]>
  findByIdQuery(id: string): Promise<TransactionDTO | null>
  /** Total already spent on one category inside a window, in cents — the single
   * number the budget check needs, without dragging every row along. */
  sumSpentByCategory(ownerId: string, categoryId: string, from: Date, to: Date): Promise<number>
}
