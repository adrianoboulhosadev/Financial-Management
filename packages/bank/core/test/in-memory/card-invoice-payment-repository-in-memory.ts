import {
  CardInvoicePayment,
  CardInvoicePaymentDTO,
  CardInvoicePaymentRepository,
  CardInvoicePaymentQueryRepository,
} from '../../src'

interface PaymentRow {
  id: string
  ownerId: string
  cardId: string
  period: string
  paidAt: Date | null
}

export default class CardInvoicePaymentRepositoryInMemory
  implements CardInvoicePaymentRepository, CardInvoicePaymentQueryRepository
{
  readonly payments: PaymentRow[] = []

  async findByCardAndPeriod(cardId: string, period: string): Promise<CardInvoicePayment | null> {
    const row = this.payments.find(
      (payment) => payment.cardId === cardId && payment.period === period,
    )
    return row ? new CardInvoicePayment(row) : null
  }

  async save(payment: CardInvoicePayment): Promise<void> {
    const row = {
      id: payment.id.value,
      ownerId: payment.ownerId,
      cardId: payment.cardId,
      period: payment.period.value,
      paidAt: payment.paidAt,
    }
    // Upsert on (card, period), exactly like the unique index the Prisma
    // adapter writes against.
    const index = this.payments.findIndex(
      (current) => current.cardId === row.cardId && current.period === row.period,
    )
    if (index >= 0) this.payments[index] = row
    else this.payments.push(row)
  }

  async delete(id: string): Promise<void> {
    const index = this.payments.findIndex((payment) => payment.id === id)
    if (index >= 0) this.payments.splice(index, 1)
  }

  async listByOwnerAndPeriodsQuery(
    ownerId: string,
    periods: string[],
  ): Promise<CardInvoicePaymentDTO[]> {
    return this.payments
      .filter((payment) => payment.ownerId === ownerId && periods.includes(payment.period))
      .map(({ cardId, period, paidAt }) => ({ cardId, period, paidAt }))
  }
}
