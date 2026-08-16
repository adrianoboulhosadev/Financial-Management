import { UseCase } from 'shared'
import { Transaction } from '../model'
import { RecurrenceRepository, RecurrenceQueue } from '../providers'

interface Input {
  recurrenceId: string
}

/**
 * SYSTEM use case (the worker runs it off a delayed job): posts the month's
 * occurrence of a recurrence and schedules the next one. There is no actor —
 * nobody asked for it, the calendar did — so there is no ownership check
 * either; the recurrence carries its own owner.
 *
 * IDEMPOTENT by construction, which matters because a queue delivers at least
 * once:
 * - a recurrence that no longer exists, or was paused after the job was
 *   scheduled, does nothing;
 * - the write is one composed operation on the port, and the transaction it
 *   posts is unique per (recurrence, day), so re-running a month already posted
 *   writes nothing and still moves the schedule forward.
 */
export default class RunRecurrence implements UseCase<Input, void> {
  constructor(
    private readonly repository: RecurrenceRepository,
    private readonly queue?: RecurrenceQueue,
  ) {}

  async execute({ recurrenceId }: Input): Promise<void> {
    const recurrence = await this.repository.findById(recurrenceId)
    if (!recurrence || !recurrence.active) return

    const transaction = new Transaction({
      ownerId: recurrence.ownerId,
      type: recurrence.type,
      categoryId: recurrence.categoryId,
      description: recurrence.description,
      amount: recurrence.amount.cents,
      occurredOn: recurrence.dueOn,
      recurrenceId: recurrence.id.value,
    })

    recurrence.markPosted()
    await this.repository.postOccurrence(transaction, recurrence)
    await this.queue?.scheduleRun({ recurrenceId: recurrence.id.value, at: recurrence.nextRunAt })
  }
}
