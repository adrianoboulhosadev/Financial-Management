import { TransactionType } from './transaction-type'

/**
 * READ projection (CQRS) of a recorded movement. Plain interface — no entity, no
 * value objects. It carries `categoryId` but NOT the category's name: naming is
 * the `category` context's business, and the front already holds the tree it
 * uses to render the picker, so joining here would only couple two contexts to
 * save one lookup the client already has.
 */
export interface TransactionDTO {
  id: string
  ownerId: string
  type: TransactionType
  categoryId: string | null
  description: string
  // INTEGER CENTS.
  amount: number
  occurredOn: Date
  attachmentUrl: string | null
  recurrenceId: string | null
  createdAt: Date
}

/** READ projection of a fixed monthly movement. */
export interface RecurrenceDTO {
  id: string
  ownerId: string
  type: TransactionType
  categoryId: string | null
  description: string
  amount: number
  dayOfMonth: number
  active: boolean
  nextRunAt: Date
  lastRunAt: Date | null
}

/** What a month adds up to. `net` is what is left over: income − expense. */
export interface MonthlyTotalsDTO {
  incomeCents: number
  expenseCents: number
  netCents: number
  byCategory: CategoryTotalDTO[]
}

export interface CategoryTotalDTO {
  // null groups the incomes recorded without a category.
  categoryId: string | null
  spentCents: number
}
