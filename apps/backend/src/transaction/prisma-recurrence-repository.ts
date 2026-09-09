import { Injectable } from '@nestjs/common'
import {
  RecurrenceRepository,
  RecurrenceQueryRepository,
  Recurrence,
  RecurrenceDTO,
  RecurrencePaymentDTO,
  Transaction,
  TransactionType,
  PaymentMethod,
} from '@transaction/adapters'
import { PrismaService } from '../db/prisma.service'

interface RecurrenceRow {
  id: string
  ownerId: string
  type: string
  categoryId: string | null
  description: string
  amount: number
  dayOfMonth: number
  active: boolean
  variableAmount: boolean
  autoPaid: boolean
  bankId: string | null
  cardId: string | null
  paymentMethod: string | null
  nextRunAt: Date
  lastRunAt: Date | null
}

@Injectable()
export class PrismaRecurrenceRepository
  implements RecurrenceRepository, RecurrenceQueryRepository
{
  constructor(private readonly prisma: PrismaService) {}

  private reconstitute(row: RecurrenceRow): Recurrence {
    return new Recurrence({
      id: row.id,
      ownerId: row.ownerId,
      type: row.type,
      categoryId: row.categoryId,
      description: row.description,
      amount: row.amount,
      dayOfMonth: row.dayOfMonth,
      active: row.active,
      variableAmount: row.variableAmount,
      autoPaid: row.autoPaid,
      bankId: row.bankId,
      cardId: row.cardId,
      paymentMethod: row.paymentMethod,
      nextRunAt: row.nextRunAt,
      lastRunAt: row.lastRunAt,
    })
  }

  async findById(id: string): Promise<Recurrence | null> {
    const row = await this.prisma.recurrence.findUnique({ where: { id } })
    return row ? this.reconstitute(row) : null
  }

  async create(recurrence: Recurrence): Promise<void> {
    await this.prisma.recurrence.create({ data: this.dataOf(recurrence) })
  }

  async update(recurrence: Recurrence): Promise<void> {
    await this.prisma.recurrence.update({
      where: { id: recurrence.id.value },
      data: {
        categoryId: recurrence.categoryId,
        description: recurrence.description,
        amount: recurrence.amount.cents,
        dayOfMonth: recurrence.dayOfMonth,
        active: recurrence.active,
        autoPaid: recurrence.autoPaid,
        bankId: recurrence.bankId,
        cardId: recurrence.cardId,
        paymentMethod: recurrence.paymentMethod,
        nextRunAt: recurrence.nextRunAt,
        lastRunAt: recurrence.lastRunAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recurrence.delete({ where: { id } })
  }

  async existsByCategory(categoryId: string): Promise<boolean> {
    const found = await this.prisma.recurrence.findFirst({
      where: { categoryId },
      select: { id: true },
    })
    return found !== null
  }

  async existsByBank(bankId: string): Promise<boolean> {
    const found = await this.prisma.recurrence.findFirst({ where: { bankId }, select: { id: true } })
    return found !== null
  }

  async existsByCard(cardId: string): Promise<boolean> {
    const found = await this.prisma.recurrence.findFirst({ where: { cardId }, select: { id: true } })
    return found !== null
  }

  /**
   * Posting the month's movement and advancing the schedule are ONE fact, so
   * they share a single database transaction — the port promises it, and this
   * is where the promise is kept. `skipDuplicates` on the (recurrence_id,
   * occurred_on) unique index is what makes a redelivered job a no-op instead
   * of a second charge; the boolean says whether the row was actually written.
   */
  async postOccurrence(transaction: Transaction, recurrence: Recurrence): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const written = await tx.transaction.createMany({
        data: [
          {
            id: transaction.id.value,
            ownerId: transaction.ownerId,
            type: transaction.type,
            categoryId: transaction.categoryId,
            description: transaction.description,
            amount: transaction.amount.cents,
            occurredOn: transaction.occurredOn,
            recurrenceId: transaction.recurrenceId,
            bankId: transaction.bankId,
            cardId: transaction.cardId,
            paymentMethod: transaction.paymentMethod,
          },
        ],
        skipDuplicates: true,
      })

      await tx.recurrence.update({
        where: { id: recurrence.id.value },
        data: { nextRunAt: recurrence.nextRunAt, lastRunAt: recurrence.lastRunAt },
      })

      return written.count > 0
    })
  }

  async listByOwnerQuery(ownerId: string): Promise<RecurrenceDTO[]> {
    const rows = await this.prisma.recurrence.findMany({
      where: { ownerId },
      orderBy: [{ active: 'desc' }, { dayOfMonth: 'asc' }],
    })
    return rows.map((row) => this.toDTO(row))
  }

  async findByIdQuery(id: string): Promise<RecurrenceDTO | null> {
    const row = await this.prisma.recurrence.findUnique({ where: { id } })
    return row ? this.toDTO(row) : null
  }

  /** The deviations recorded for one month — usually far fewer rows than there
   * are recurrences, which is the whole point of storing only deviations. */
  async listPaymentsQuery(ownerId: string, period: string): Promise<RecurrencePaymentDTO[]> {
    const rows = await this.prisma.recurrencePayment.findMany({ where: { ownerId, period } })
    return rows.map((row) => ({
      id: row.id,
      ownerId: row.ownerId,
      recurrenceId: row.recurrenceId,
      period: row.period,
      amount: row.amount,
      paidAt: row.paidAt,
    }))
  }

  /**
   * Which recurrences already produced a real movement inside the window. One
   * `distinct` instead of dragging the month's rows back just to look at their
   * recurrenceId — this is what keeps the month's totals from counting a posted
   * bill twice.
   */
  async listPostedRecurrenceIds(ownerId: string, from: Date, to: Date): Promise<string[]> {
    const rows = await this.prisma.transaction.findMany({
      where: { ownerId, recurrenceId: { not: null }, occurredOn: { gte: from, lt: to } },
      select: { recurrenceId: true },
      distinct: ['recurrenceId'],
    })
    return rows
      .map((row) => row.recurrenceId)
      .filter((recurrenceId): recurrenceId is string => recurrenceId !== null)
  }

  private dataOf(recurrence: Recurrence) {
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

  private toDTO(row: RecurrenceRow): RecurrenceDTO {
    return {
      ...row,
      type: row.type as TransactionType,
      paymentMethod: row.paymentMethod as PaymentMethod | null,
    }
  }
}
