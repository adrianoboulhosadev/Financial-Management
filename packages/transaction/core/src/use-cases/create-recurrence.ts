import { UseCase } from 'shared'
import { Recurrence } from '../model'
import { RecurrenceRepository, RecurrenceQueue } from '../providers'

interface Input {
  ownerId: string
  type: string
  categoryId?: string | null
  description: string
  amount: number
  dayOfMonth: number
  /** A bill whose amount changes every month; `amount` is then the estimate.
   * Declared here and never again — see the entity. */
  variableAmount?: boolean
  autoPaid?: boolean
  bankId?: string | null
  cardId?: string | null
  paymentMethod?: string | null
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
    const recurrence = new Recurrence({
      ownerId: input.ownerId,
      type: input.type,
      categoryId: input.categoryId,
      description: input.description,
      amount: input.amount,
      dayOfMonth: input.dayOfMonth,
      variableAmount: input.variableAmount,
      autoPaid: input.autoPaid,
      bankId: input.bankId,
      cardId: input.cardId,
      paymentMethod: input.paymentMethod,
    })

    await this.repository.create(recurrence)
    await this.queue?.scheduleRun({ recurrenceId: recurrence.id.value, at: recurrence.nextRunAt })
  }
}
