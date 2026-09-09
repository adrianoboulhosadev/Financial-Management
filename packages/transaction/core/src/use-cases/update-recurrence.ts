import { UseCase, NotFoundError, Errors } from 'shared'
import { RecurrenceRepository, RecurrenceQueue } from '../providers'

interface Input {
  ownerId: string
  recurrenceId: string
  categoryId?: string | null
  description?: string
  amount?: number
  dayOfMonth?: number
  /** A new deadline counted from the NEXT occurrence, or `null` to go back to
   * repeating forever. Omit to leave the deadline alone. */
  durationMonths?: number | null
  autoPaid?: boolean
  bankId?: string | null
  cardId?: string | null
  paymentMethod?: string | null
}

/**
 * Edits a fixed movement. Changing the day re-schedules it (the entity decides
 * to when), so the queue is asked again — an extra job for an unchanged date is
 * harmless, since running a month already posted is a no-op (see RunRecurrence).
 *
 * `variableAmount` is deliberately absent: it is fixed at creation, because
 * flipping it on a recurrence whose months were already adjusted would leave
 * figures nobody could explain. The DEADLINE, on the other hand, is editable:
 * a course gets extended, and re-counting from the next occurrence is what
 * "mais N meses" means.
 */
export default class UpdateRecurrence implements UseCase<Input, void> {
  constructor(
    private readonly repository: RecurrenceRepository,
    private readonly queue?: RecurrenceQueue,
  ) {}

  async execute(input: Input): Promise<void> {
    const recurrence = await this.repository.findById(input.recurrenceId)
    if (!recurrence || !recurrence.belongsTo(input.ownerId)) {
      NotFoundError.throwError(Errors.RECURRENCE_NOT_FOUND, input.recurrenceId)
    }

    recurrence.edit({
      categoryId: input.categoryId,
      description: input.description,
      amount: input.amount,
      dayOfMonth: input.dayOfMonth,
      autoPaid: input.autoPaid,
      bankId: input.bankId,
      cardId: input.cardId,
      paymentMethod: input.paymentMethod,
    })

    // Re-counted from the next occurrence, so "mais 3 meses" means three more
    // charges from here — never three from a start date already in the past.
    if (input.durationMonths !== undefined) {
      if (input.durationMonths === null) recurrence.clearDeadline()
      else recurrence.limitToMonths(input.durationMonths)
    }

    await this.repository.update(recurrence)
    if (recurrence.active) {
      await this.queue?.scheduleRun({ recurrenceId: recurrence.id.value, at: recurrence.nextRunAt })
    }
  }
}
