import {
  Recurrence,
  RecurrenceDTO,
  RecurrencePaymentDTO,
  RecurrenceRepository,
  RecurrenceQueryRepository,
  Transaction,
  TransactionType,
  PaymentMethod,
} from '../../src'
import RecurrencePaymentRepositoryInMemory from './recurrence-payment-repository-in-memory'
import TransactionRepositoryInMemory from './transaction-repository-in-memory'

interface RecurrenceRow {
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

/**
 * Shares the transaction fake so `postOccurrence` writes where the tests read
 * — the same single-commit guarantee the Prisma adapter gets from a database
 * transaction.
 */
export default class RecurrenceRepositoryInMemory
  implements RecurrenceRepository, RecurrenceQueryRepository
{
  readonly recurrences: RecurrenceRow[] = []

  constructor(
    private readonly transactions = new TransactionRepositoryInMemory(),
    private readonly payments = new RecurrencePaymentRepositoryInMemory(),
  ) {}

  get transactionRepository(): TransactionRepositoryInMemory {
    return this.transactions
  }

  get paymentRepository(): RecurrencePaymentRepositoryInMemory {
    return this.payments
  }

  async findById(id: string): Promise<Recurrence | null> {
    const row = this.recurrences.find((recurrence) => recurrence.id === id)
    return row ? new Recurrence(row) : null
  }

  async create(recurrence: Recurrence): Promise<void> {
    this.recurrences.push(this.toRow(recurrence))
  }

  async update(recurrence: Recurrence): Promise<void> {
    const index = this.recurrences.findIndex((current) => current.id === recurrence.id.value)
    if (index >= 0) this.recurrences[index] = this.toRow(recurrence)
  }

  async delete(id: string): Promise<void> {
    const index = this.recurrences.findIndex((recurrence) => recurrence.id === id)
    if (index >= 0) this.recurrences.splice(index, 1)
  }

  async existsByCategory(categoryId: string): Promise<boolean> {
    return this.recurrences.some((recurrence) => recurrence.categoryId === categoryId)
  }

  async existsByBank(bankId: string): Promise<boolean> {
    return this.recurrences.some((recurrence) => recurrence.bankId === bankId)
  }

  async existsByCard(cardId: string): Promise<boolean> {
    return this.recurrences.some((recurrence) => recurrence.cardId === cardId)
  }

  async postOccurrence(transaction: Transaction, recurrence: Recurrence): Promise<boolean> {
    // Stands in for the database's (recurrence_id, occurred_on) unique index:
    // a month already posted is skipped, never duplicated.
    const alreadyPosted = this.transactions.transactions.some(
      (row) =>
        row.recurrenceId === transaction.recurrenceId &&
        row.occurredOn.getTime() === transaction.occurredOn.getTime(),
    )
    if (!alreadyPosted) await this.transactions.create(transaction)
    await this.update(recurrence)
    return !alreadyPosted
  }

  async listByOwnerQuery(ownerId: string): Promise<RecurrenceDTO[]> {
    return this.recurrences.filter((row) => row.ownerId === ownerId).map((row) => ({ ...row }))
  }

  async findByIdQuery(id: string): Promise<RecurrenceDTO | null> {
    const row = this.recurrences.find((recurrence) => recurrence.id === id)
    return row ? { ...row } : null
  }

  async listPaymentsQuery(ownerId: string, period: string): Promise<RecurrencePaymentDTO[]> {
    return this.payments.listByOwnerAndPeriod(ownerId, period)
  }

  async listPostedRecurrenceIds(ownerId: string, from: Date, to: Date): Promise<string[]> {
    const rows = await this.transactions.listByOwnerQuery(ownerId, { from, to })
    return [
      ...new Set(
        rows
          .map((row) => row.recurrenceId)
          .filter((recurrenceId): recurrenceId is string => recurrenceId !== null),
      ),
    ]
  }

  private toRow(recurrence: Recurrence): RecurrenceRow {
    return {
      id: recurrence.id.value,
      ownerId: recurrence.ownerId,
      type: recurrence.type,
      categoryId: recurrence.categoryId,
      description: recurrence.description,
      amount: recurrence.amount.cents,
      dayOfMonth: recurrence.dayOfMonth,
      active: recurrence.active,
      variableAmount: recurrence.variableAmount,
      autoPaid: recurrence.autoPaid,
      bankId: recurrence.bankId,
      cardId: recurrence.cardId,
      paymentMethod: recurrence.paymentMethod,
      nextRunAt: recurrence.nextRunAt,
      lastRunAt: recurrence.lastRunAt,
    }
  }
}
