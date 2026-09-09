import { RecurrencePayment } from '../model'

/**
 * RecurrencePayment WRITE port (command side). There is no `create`/`update`
 * pair: the caller never knows whether this month already deviated from the
 * default, so `save` is an UPSERT on (recurrence, period) — which is also what
 * makes ticking the same month twice a no-op instead of a second row.
 */
export interface RecurrencePaymentRepository {
  findByRecurrenceAndPeriod(recurrenceId: string, period: string): Promise<RecurrencePayment | null>
  save(payment: RecurrencePayment): Promise<void>
  /** Drops a row that no longer remembers anything (not paid, no adjusted
   * amount) — the checklist reads the same either way, and an empty row is
   * only noise. */
  delete(id: string): Promise<void>
}
