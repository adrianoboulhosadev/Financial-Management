import { RecurrencePayment, RecurrencePaymentRepository } from '@transaction/adapters'
import { prisma } from './prisma'

/**
 * The worker's own driven adapter of the RecurrencePayment port. It implements
 * only the READ, which is the single thing this app needs it for: posting a
 * VARIABLE bill with the figure the owner wrote down for the month instead of
 * the estimate.
 *
 * The two writes throw rather than pretend to work — ticking a month off is
 * something a person does, never the calendar — so a wrong wiring fails loudly
 * at the first call instead of silently swallowing a write.
 */
export class WorkerRecurrencePaymentRepository implements RecurrencePaymentRepository {
  async findByRecurrenceAndPeriod(
    recurrenceId: string,
    period: string,
  ): Promise<RecurrencePayment | null> {
    const row = await prisma.recurrencePayment.findUnique({
      where: { recurrenceId_period: { recurrenceId, period } },
    })
    return row
      ? new RecurrencePayment({
          id: row.id,
          ownerId: row.ownerId,
          recurrenceId: row.recurrenceId,
          period: row.period,
          amount: row.amount,
          paidAt: row.paidAt,
        })
      : null
  }

  async save(): Promise<void> {
    throw new Error('the worker does not tick a month off the checklist')
  }

  async delete(): Promise<void> {
    throw new Error('the worker does not clear a month of the checklist')
  }
}
