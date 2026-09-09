import { TransactionType } from './transaction-type'
import { PaymentMethod } from './payment-method'

/**
 * READ projection (CQRS) of a recorded movement. Plain interface — no entity, no
 * value objects. It carries `categoryId` but NOT the category's name: naming is
 * the `category` context's business, and the front already holds the tree it
 * uses to render the picker, so joining here would only couple two contexts to
 * save one lookup the client already has. The same goes for `bankId`/`cardId`
 * and the `bank` context.
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
  bankId: string | null
  cardId: string | null
  paymentMethod: PaymentMethod | null
  installments: number
  installmentNumber: number
  installmentGroupId: string | null
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
  variableAmount: boolean
  autoPaid: boolean
  bankId: string | null
  cardId: string | null
  paymentMethod: PaymentMethod | null
  nextRunAt: Date
  lastRunAt: Date | null
}

/** READ projection of what the owner did about one month of one recurrence. */
export interface RecurrencePaymentDTO {
  id: string
  ownerId: string
  recurrenceId: string
  // YYYY-MM.
  period: string
  amount: number | null
  paidAt: Date | null
}

/**
 * One line of the month's checklist: a fixed movement, what it costs THIS month
 * and whether it is settled. Assembled by MonthlyChecklistCalculator from the
 * recurrences plus whatever deviations were recorded — there is no stored
 * checklist, so nothing has to be generated in advance and no month can be
 * missing from it.
 */
export interface ChecklistItemDTO {
  recurrenceId: string
  type: TransactionType
  categoryId: string | null
  description: string
  // What this month costs: the adjusted figure when the bill arrived,
  // otherwise the recurrence's amount (an estimate, if it is a variable one).
  amountCents: number
  // What the recurrence itself says it costs — worth showing next to the
  // adjusted figure so a variable bill's surprise is visible.
  estimatedCents: number
  variableAmount: boolean
  // Settled: ticked off by the owner, or self-settling and already due.
  paid: boolean
  // Null when it is paid because it settles by itself rather than because
  // somebody said so.
  paidAt: Date | null
  autoPaid: boolean
  dueOn: Date
  dayOfMonth: number
  bankId: string | null
  cardId: string | null
  paymentMethod: PaymentMethod | null
  // Whether the worker has already turned this month into a real movement —
  // which is what keeps the month's totals from counting it twice.
  posted: boolean
}

/** The month's checklist plus the two figures the screen leads with. */
export interface MonthlyChecklistDTO {
  period: string
  items: ChecklistItemDTO[]
  // Expenses only: what the fixed bills of the month add up to, and how much of
  // that is still to pay.
  totalCents: number
  paidCents: number
  pendingCents: number
}

/** What a month adds up to. `net` is what is left over: income − expense. */
export interface MonthlyTotalsDTO {
  incomeCents: number
  expenseCents: number
  netCents: number
  // Money that actually MOVED, per category — what a budget ceiling is
  // measured against.
  byCategory: CategoryTotalDTO[]
  // The same split with the month's unposted fixed bills folded in: what the
  // dashboard ranks, so the ranking adds up to the figure it leads with.
  totalByCategory: CategoryTotalDTO[]
  /**
   * The fixed bills of the month that have NOT been posted as a movement yet.
   * Kept apart from `expenseCents` on purpose: `expenseCents` is money that
   * actually moved (which is what a budget ceiling is measured against), and
   * this is money the month already owes. The dashboard adds the two; the
   * budget check deliberately does not.
   */
  committedExpenseCents: number
  committedIncomeCents: number
}

export interface CategoryTotalDTO {
  // null groups the incomes recorded without a category.
  categoryId: string | null
  spentCents: number
}
