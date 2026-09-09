import { RecurrencePayment, RecurrencePaymentDTO, RecurrencePaymentRepository } from '../../src'

interface RecurrencePaymentRow {
  id: string
  ownerId: string
  recurrenceId: string
  period: string
  amount: number | null
  paidAt: Date | null
}

/** Stands in for the (recurrence_id, period) unique index: `save` upserts, so
 * ticking the same month twice never leaves two rows. */
export default class RecurrencePaymentRepositoryInMemory implements RecurrencePaymentRepository {
  readonly payments: RecurrencePaymentRow[] = []

  async findByRecurrenceAndPeriod(
    recurrenceId: string,
    period: string,
  ): Promise<RecurrencePayment | null> {
    const row = this.payments.find(
      (payment) => payment.recurrenceId === recurrenceId && payment.period === period,
    )
    return row ? new RecurrencePayment(row) : null
  }

  async save(payment: RecurrencePayment): Promise<void> {
    const row = this.toRow(payment)
    const index = this.payments.findIndex(
      (current) =>
        current.recurrenceId === row.recurrenceId && current.period === row.period,
    )
    if (index >= 0) this.payments[index] = row
    else this.payments.push(row)
  }

  async delete(id: string): Promise<void> {
    const index = this.payments.findIndex((payment) => payment.id === id)
    if (index >= 0) this.payments.splice(index, 1)
  }

  async listByOwnerAndPeriod(ownerId: string, period: string): Promise<RecurrencePaymentDTO[]> {
    return this.payments
      .filter((payment) => payment.ownerId === ownerId && payment.period === period)
      .map((row) => ({ ...row }))
  }

  private toRow(payment: RecurrencePayment): RecurrencePaymentRow {
    return {
      id: payment.id.value,
      ownerId: payment.ownerId,
      recurrenceId: payment.recurrenceId,
      period: payment.period.value,
      amount: payment.amount?.cents ?? null,
      paidAt: payment.paidAt,
    }
  }
}
