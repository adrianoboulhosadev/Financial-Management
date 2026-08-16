import { Recurrence, Transaction } from '../model'

/**
 * Recurrence WRITE port (command side).
 *
 * `postOccurrence` is a COMPOSED operation on purpose: writing the transaction
 * and advancing the recurrence are one fact, and doing them in two calls would
 * let a crash in between either post a month twice or skip it forever. The
 * adapter wraps both in a single database transaction — the core never knows
 * how. Its return says whether the row was actually written: a retried job for
 * a month already posted is a no-op, not an error.
 */
export interface RecurrenceRepository {
  findById(id: string): Promise<Recurrence | null>
  create(recurrence: Recurrence): Promise<void>
  update(recurrence: Recurrence): Promise<void>
  delete(id: string): Promise<void>
  existsByCategory(categoryId: string): Promise<boolean>
  postOccurrence(transaction: Transaction, recurrence: Recurrence): Promise<boolean>
}
