import {
  Transaction,
  TransactionDTO,
  TransactionRepository,
  TransactionQueryRepository,
  TransactionFilter,
  TransactionType,
} from '../../src'

interface TransactionRow {
  id: string
  ownerId: string
  type: TransactionType
  categoryId: string | null
  description: string
  amount: number
  occurredOn: Date
  attachmentUrl: string | null
  recurrenceId: string | null
  createdAt: Date
}

export default class TransactionRepositoryInMemory
  implements TransactionRepository, TransactionQueryRepository
{
  readonly transactions: TransactionRow[] = []

  async findById(id: string): Promise<Transaction | null> {
    const row = this.transactions.find((transaction) => transaction.id === id)
    return row ? new Transaction(row) : null
  }

  async create(transaction: Transaction): Promise<void> {
    this.transactions.push(this.toRow(transaction))
  }

  async update(transaction: Transaction): Promise<void> {
    const index = this.transactions.findIndex((current) => current.id === transaction.id.value)
    if (index >= 0) {
      this.transactions[index] = { ...this.transactions[index], ...this.toRow(transaction) }
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.transactions.findIndex((transaction) => transaction.id === id)
    if (index >= 0) this.transactions.splice(index, 1)
  }

  async existsByCategory(categoryId: string): Promise<boolean> {
    return this.transactions.some((transaction) => transaction.categoryId === categoryId)
  }

  async listByOwnerQuery(ownerId: string, filter?: TransactionFilter): Promise<TransactionDTO[]> {
    return this.transactions
      .filter((row) => row.ownerId === ownerId)
      .filter((row) => !filter?.from || row.occurredOn.getTime() >= filter.from.getTime())
      // Exclusive upper bound, exactly like the [start, end) window MonthPeriod builds.
      .filter((row) => !filter?.to || row.occurredOn.getTime() < filter.to.getTime())
      .filter((row) => !filter?.type || row.type === filter.type)
      .filter((row) => !filter?.categoryId || row.categoryId === filter.categoryId)
      .sort((left, right) => right.occurredOn.getTime() - left.occurredOn.getTime())
      .map((row) => ({ ...row }))
  }

  async findByIdQuery(id: string): Promise<TransactionDTO | null> {
    const row = this.transactions.find((transaction) => transaction.id === id)
    return row ? { ...row } : null
  }

  async sumSpentByCategory(
    ownerId: string,
    categoryId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    return this.transactions
      .filter(
        (row) =>
          row.ownerId === ownerId &&
          row.categoryId === categoryId &&
          row.type === 'expense' &&
          row.occurredOn.getTime() >= from.getTime() &&
          row.occurredOn.getTime() < to.getTime(),
      )
      .reduce((total, row) => total + row.amount, 0)
  }

  private toRow(transaction: Transaction): TransactionRow {
    return {
      id: transaction.id.value,
      ownerId: transaction.ownerId,
      type: transaction.type,
      categoryId: transaction.categoryId,
      description: transaction.description,
      amount: transaction.amount.cents,
      occurredOn: transaction.occurredOn,
      attachmentUrl: transaction.attachmentUrl,
      recurrenceId: transaction.recurrenceId,
      createdAt: new Date(),
    }
  }
}
