import { UseCase, NotFoundError, Errors } from 'shared'
import { RecurrenceRepository, RecurrenceQueue } from '../providers'

interface Input {
  ownerId: string
  recurrenceId: string
  categoryId?: string | null
  description?: string
  amount?: number
  dayOfMonth?: number
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
 * figures nobody could explain.
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

    await this.repository.update(recurrence)
    if (recurrence.active) {
      await this.queue?.scheduleRun({ recurrenceId: recurrence.id.value, at: recurrence.nextRunAt })
    }
  }
}
