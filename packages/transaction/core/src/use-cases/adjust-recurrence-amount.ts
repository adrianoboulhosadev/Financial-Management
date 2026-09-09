import { UseCase, NotFoundError, ValidationError, Errors } from 'shared'
import { RecurrencePayment } from '../model'
import { RecurrenceRepository, RecurrencePaymentRepository } from '../providers'

interface Input {
  ownerId: string
  recurrenceId: string
  // YYYY-MM.
  period: string
  /** What the bill actually came to, in INTEGER CENTS. `null` clears the
   * adjustment and puts the recurrence's estimate back in charge. */
  amount: number | null
}

/**
 * Writes down what a VARIABLE fixed bill actually came to in one month — the
 * electricity bill, once it arrives.
 *
 * The rule that only a variable recurrence may be adjusted lives here and not
 * in the entity because it spans two of them: the payment row knows the amount,
 * the recurrence knows whether the amount is allowed to move. A fixed bill
 * answers RECURRENCE_NOT_VARIABLE — its amount is an edit to the recurrence
 * itself, which is a different thing and applies to every month from then on.
 */
export default class AdjustRecurrenceAmount implements UseCase<Input, void> {
  constructor(
    private readonly recurrenceRepository: RecurrenceRepository,
    private readonly paymentRepository: RecurrencePaymentRepository,
  ) {}

  async execute({ ownerId, recurrenceId, period, amount }: Input): Promise<void> {
    const recurrence = await this.recurrenceRepository.findById(recurrenceId)
    if (!recurrence || !recurrence.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.RECURRENCE_NOT_FOUND, recurrenceId)
    }
    if (!recurrence.variableAmount) {
      ValidationError.throwError(Errors.RECURRENCE_NOT_VARIABLE, recurrenceId)
    }

    const payment =
      (await this.paymentRepository.findByRecurrenceAndPeriod(recurrenceId, period)) ??
      new RecurrencePayment({ ownerId, recurrenceId, period })

    payment.adjustAmount(amount)

    // Clearing the amount on a month that was never ticked off leaves a row
    // remembering nothing.
    if (payment.isEmpty) {
      await this.paymentRepository.delete(payment.id.value)
      return
    }

    await this.paymentRepository.save(payment)
  }
}
