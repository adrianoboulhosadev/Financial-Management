import { UseCase, NotFoundError, Errors } from 'shared'
import { RecurrencePayment } from '../model'
import { RecurrenceRepository, RecurrencePaymentRepository } from '../providers'

interface Input {
  ownerId: string
  recurrenceId: string
  // YYYY-MM.
  period: string
  paid: boolean
}

/**
 * Ticks one month of one fixed bill off the checklist (or un-ticks it). The
 * checklist itself is derived, so this writes only the DEVIATION — and when
 * un-ticking leaves nothing left to remember (no adjusted amount either), the
 * row goes away rather than lingering as a record of nothing.
 *
 * The recurrence is loaded first for the ownership check: a bill belonging to
 * someone else answers as missing, never as forbidden (anti-IDOR).
 */
export default class SetRecurrencePaid implements UseCase<Input, void> {
  constructor(
    private readonly recurrenceRepository: RecurrenceRepository,
    private readonly paymentRepository: RecurrencePaymentRepository,
  ) {}

  async execute({ ownerId, recurrenceId, period, paid }: Input): Promise<void> {
    const recurrence = await this.recurrenceRepository.findById(recurrenceId)
    if (!recurrence || !recurrence.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.RECURRENCE_NOT_FOUND, recurrenceId)
    }

    const payment =
      (await this.paymentRepository.findByRecurrenceAndPeriod(recurrenceId, period)) ??
      new RecurrencePayment({ ownerId, recurrenceId, period })

    if (paid) payment.markPaid()
    else payment.markUnpaid()

    if (payment.isEmpty) {
      await this.paymentRepository.delete(payment.id.value)
      return
    }

    await this.paymentRepository.save(payment)
  }
}
