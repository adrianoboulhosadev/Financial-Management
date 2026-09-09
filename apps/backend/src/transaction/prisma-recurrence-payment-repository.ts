import { Injectable } from '@nestjs/common'
import { RecurrencePayment, RecurrencePaymentRepository } from '@transaction/adapters'
import { PrismaService } from '../db/prisma.service'

interface RecurrencePaymentRow {
  id: string
  ownerId: string
  recurrenceId: string
  period: string
  amount: number | null
  paidAt: Date | null
}

/**
 * Writes what the owner did about one month of one fixed bill. There is no
 * create/update pair on the port because the caller never knows whether the
 * month already deviated from the default — `save` is an UPSERT on the
 * (recurrence_id, period) unique index, which is also what makes ticking the
 * same month twice a no-op instead of a second row.
 */
@Injectable()
export class PrismaRecurrencePaymentRepository implements RecurrencePaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private reconstitute(row: RecurrencePaymentRow): RecurrencePayment {
    return new RecurrencePayment({
      id: row.id,
      ownerId: row.ownerId,
      recurrenceId: row.recurrenceId,
      period: row.period,
      amount: row.amount,
      paidAt: row.paidAt,
    })
  }

  async findByRecurrenceAndPeriod(
    recurrenceId: string,
    period: string,
  ): Promise<RecurrencePayment | null> {
    const row = await this.prisma.recurrencePayment.findUnique({
      where: { recurrenceId_period: { recurrenceId, period } },
    })
    return row ? this.reconstitute(row) : null
  }

  async save(payment: RecurrencePayment): Promise<void> {
    // Reads the cents off the value object and the string off MonthPeriod — the
    // columns are an Int and a plain 'YYYY-MM'.
    const amount = payment.amount?.cents ?? null
    await this.prisma.recurrencePayment.upsert({
      where: {
        recurrenceId_period: { recurrenceId: payment.recurrenceId, period: payment.period.value },
      },
      create: {
        id: payment.id.value,
        ownerId: payment.ownerId,
        recurrenceId: payment.recurrenceId,
        period: payment.period.value,
        amount,
        paidAt: payment.paidAt,
      },
      update: { amount, paidAt: payment.paidAt },
    })
  }

  async delete(id: string): Promise<void> {
    // Tolerant on purpose: the row this is asked to drop may never have reached
    // the database (a month un-ticked right after being built in memory).
    await this.prisma.recurrencePayment.deleteMany({ where: { id } })
  }
}
