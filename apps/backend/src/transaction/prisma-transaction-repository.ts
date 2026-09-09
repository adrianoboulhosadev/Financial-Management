import { Injectable } from '@nestjs/common'
import {
  TransactionRepository,
  TransactionQueryRepository,
  TransactionFilter,
  Transaction,
  TransactionDTO,
  TransactionType,
  PaymentMethod,
} from '@transaction/adapters'
import { Prisma } from 'database'
import { PrismaService } from '../db/prisma.service'

interface TransactionRow {
  id: string
  ownerId: string
  type: string
  categoryId: string | null
  description: string
  amount: number
  occurredOn: Date
  attachmentUrl: string | null
  recurrenceId: string | null
  bankId: string | null
  cardId: string | null
  paymentMethod: string | null
  installments: number
  installmentNumber: number
  installmentGroupId: string | null
  createdAt: Date
}

@Injectable()
export class PrismaTransactionRepository
  implements TransactionRepository, TransactionQueryRepository
{
  constructor(private readonly prisma: PrismaService) {}

  private reconstitute(row: TransactionRow): Transaction {
    return new Transaction({
      id: row.id,
      ownerId: row.ownerId,
      type: row.type,
      categoryId: row.categoryId,
      description: row.description,
      amount: row.amount,
      occurredOn: row.occurredOn,
      attachmentUrl: row.attachmentUrl,
      recurrenceId: row.recurrenceId,
      bankId: row.bankId,
      cardId: row.cardId,
      paymentMethod: row.paymentMethod,
      installments: row.installments,
      installmentNumber: row.installmentNumber,
      installmentGroupId: row.installmentGroupId,
    })
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.prisma.transaction.findUnique({ where: { id } })
    return row ? this.reconstitute(row) : null
  }

  async create(transaction: Transaction): Promise<void> {
    await this.prisma.transaction.create({ data: this.dataOf(transaction) })
  }

  /** ONE statement, so a split purchase leaves every month or no month at all —
   * which is the promise the port makes. */
  async createMany(transactions: Transaction[]): Promise<void> {
    await this.prisma.transaction.createMany({
      data: transactions.map((transaction) => this.dataOf(transaction)),
    })
  }

  async update(transaction: Transaction): Promise<void> {
    await this.prisma.transaction.update({
      where: { id: transaction.id.value },
      data: {
        categoryId: transaction.categoryId,
        description: transaction.description,
        amount: transaction.amount.cents,
        occurredOn: transaction.occurredOn,
        attachmentUrl: transaction.attachmentUrl,
        bankId: transaction.bankId,
        cardId: transaction.cardId,
        paymentMethod: transaction.paymentMethod,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } })
  }

  async existsByCategory(categoryId: string): Promise<boolean> {
    const found = await this.prisma.transaction.findFirst({
      where: { categoryId },
      select: { id: true },
    })
    return found !== null
  }

  async existsByBank(bankId: string): Promise<boolean> {
    const found = await this.prisma.transaction.findFirst({
      where: { bankId },
      select: { id: true },
    })
    return found !== null
  }

  async existsByCard(cardId: string): Promise<boolean> {
    const found = await this.prisma.transaction.findFirst({
      where: { cardId },
      select: { id: true },
    })
    return found !== null
  }

  async listByOwnerQuery(ownerId: string, filter?: TransactionFilter): Promise<TransactionDTO[]> {
    const rows = await this.prisma.transaction.findMany({
      where: this.whereOf(ownerId, filter),
      // Newest movement first; the id breaks the tie so two entries on the same
      // day never swap places between two reads.
      orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    })
    return rows.map((row) => this.toDTO(row))
  }

  async findByIdQuery(id: string): Promise<TransactionDTO | null> {
    const row = await this.prisma.transaction.findUnique({ where: { id } })
    return row ? this.toDTO(row) : null
  }

  /** One aggregate instead of dragging every row back just to add them up. */
  async sumSpentByCategory(
    ownerId: string,
    categoryId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: { ownerId, categoryId, type: 'expense', occurredOn: { gte: from, lt: to } },
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  }

  private whereOf(ownerId: string, filter?: TransactionFilter): Prisma.TransactionWhereInput {
    const where: Prisma.TransactionWhereInput = { ownerId }
    if (filter?.type) where.type = filter.type
    if (filter?.categoryId) where.categoryId = filter.categoryId
    if (filter?.bankId) where.bankId = filter.bankId
    // [from, to) — an exclusive upper bound, the same window MonthPeriod builds,
    // which is what keeps the last day of a month from being cut off.
    if (filter?.from || filter?.to) {
      where.occurredOn = { ...(filter.from && { gte: filter.from }), ...(filter.to && { lt: filter.to }) }
    }
    return where
  }

  private dataOf(transaction: Transaction) {
    return {
      id: transaction.id.value,
      ownerId: transaction.ownerId,
      type: transaction.type,
      categoryId: transaction.categoryId,
      description: transaction.description,
      // Reads the cents off the value object — the column is an Int.
      amount: transaction.amount.cents,
      occurredOn: transaction.occurredOn,
      attachmentUrl: transaction.attachmentUrl,
      recurrenceId: transaction.recurrenceId,
      bankId: transaction.bankId,
      cardId: transaction.cardId,
      paymentMethod: transaction.paymentMethod,
      installments: transaction.installments,
      installmentNumber: transaction.installmentNumber,
      installmentGroupId: transaction.installmentGroupId,
    }
  }

  private toDTO(row: TransactionRow): TransactionDTO {
    return {
      ...row,
      type: row.type as TransactionType,
      paymentMethod: row.paymentMethod as PaymentMethod | null,
    }
  }
}
