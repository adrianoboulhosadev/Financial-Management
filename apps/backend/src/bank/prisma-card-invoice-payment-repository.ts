import { Injectable } from '@nestjs/common'
import {
  CardInvoicePayment,
  CardInvoicePaymentDTO,
  CardInvoicePaymentRepository,
  CardInvoicePaymentQueryRepository,
} from '@bank/adapters'
import { PrismaService } from '../db/prisma.service'

interface CardInvoicePaymentRow {
  id: string
  ownerId: string
  cardId: string
  period: string
  paidAt: Date | null
}

/**
 * Writes what the owner did about one invoice of one card. There is no
 * create/update pair on the port because the caller never knows whether the
 * invoice was already ticked — `save` is an UPSERT on the (card_id, period)
 * unique index, which is what makes ticking the same invoice twice a no-op
 * instead of a second row.
 */
@Injectable()
export class PrismaCardInvoicePaymentRepository
  implements CardInvoicePaymentRepository, CardInvoicePaymentQueryRepository
{
  constructor(private readonly prisma: PrismaService) {}

  private reconstitute(row: CardInvoicePaymentRow): CardInvoicePayment {
    return new CardInvoicePayment({
      id: row.id,
      ownerId: row.ownerId,
      cardId: row.cardId,
      period: row.period,
      paidAt: row.paidAt,
    })
  }

  async findByCardAndPeriod(cardId: string, period: string): Promise<CardInvoicePayment | null> {
    const row = await this.prisma.cardInvoicePayment.findUnique({
      where: { cardId_period: { cardId, period } },
    })
    return row ? this.reconstitute(row) : null
  }

  async save(payment: CardInvoicePayment): Promise<void> {
    // Reads the string off MonthPeriod — the column is a plain 'YYYY-MM'.
    const period = payment.period.value
    await this.prisma.cardInvoicePayment.upsert({
      where: { cardId_period: { cardId: payment.cardId, period } },
      create: {
        id: payment.id.value,
        ownerId: payment.ownerId,
        cardId: payment.cardId,
        period,
        paidAt: payment.paidAt,
      },
      update: { paidAt: payment.paidAt },
    })
  }

  async delete(id: string): Promise<void> {
    // Tolerant on purpose: the row this is asked to drop may never have reached
    // the database (an invoice un-ticked right after being built in memory).
    await this.prisma.cardInvoicePayment.deleteMany({ where: { id } })
  }

  async listByOwnerAndPeriodsQuery(
    ownerId: string,
    periods: string[],
  ): Promise<CardInvoicePaymentDTO[]> {
    const rows = await this.prisma.cardInvoicePayment.findMany({
      where: { ownerId, period: { in: periods } },
      select: { cardId: true, period: true, paidAt: true },
    })
    return rows
  }
}
