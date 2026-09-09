import { RecurrenceDTO, RecurrencePaymentDTO } from '../model'

/** Recurrence READ port (query side of CQRS). */
export interface RecurrenceQueryRepository {
  listByOwnerQuery(ownerId: string): Promise<RecurrenceDTO[]>
  findByIdQuery(id: string): Promise<RecurrenceDTO | null>
  /** The deviations the owner recorded for one month — an adjusted amount, a
   * month ticked off. Usually far fewer rows than there are recurrences, which
   * is the whole point of storing only deviations. */
  listPaymentsQuery(ownerId: string, period: string): Promise<RecurrencePaymentDTO[]>
  /** Which recurrences already produced a real movement inside the window —
   * what keeps the month's totals from counting a posted bill twice. */
  listPostedRecurrenceIds(ownerId: string, from: Date, to: Date): Promise<string[]>
}
