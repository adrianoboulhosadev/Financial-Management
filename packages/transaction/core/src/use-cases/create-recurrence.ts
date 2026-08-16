import { UseCase, ValidationError, Errors } from 'shared'
import { Recurrence } from '../model'
import { RecurrenceRepository, RecurrenceQueue } from '../providers'

interface Input {
  ownerId: string
  type: string
  categoryId?: string | null
  description: string
  amount: number
  dayOfMonth: number
  categoryIsLeaf?: boolean
}

/**
 * Creates a fixed monthly movement. The entity works out when it is next due;
 * this use case only persists it and asks the queue to run it then — the same
 * shape as any other optional port, so a caller that does not care about
 * scheduling (a test, a script) simply does not pass one.
 */
export default class CreateRecurrence implements UseCase<Input, void> {
  constructor(
    private readonly repository: RecurrenceRepository,
    private readonly queue?: RecurrenceQueue,
  ) {}

  async execute(input: Input): Promise<void> {
    if (input.categoryId && input.categoryIsLeaf === false) {
      ValidationError.throwError(Errors.CATEGORY_NOT_LEAF, input.categoryId)
    }

    const recurrence = new Recurrence({
      ownerId: input.ownerId,
      type: input.type,
      categoryId: input.categoryId,
      description: input.description,
      amount: input.amount,
      dayOfMonth: input.dayOfMonth,
    })

    await this.repository.create(recurrence)
    await this.queue?.scheduleRun({ recurrenceId: recurrence.id.value, at: recurrence.nextRunAt })
  }
}
