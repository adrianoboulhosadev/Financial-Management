import { UseCase, MonthPeriod } from 'shared'
import { Transaction } from '../model'
import {
  RecurrenceRepository,
  RecurrenceQueue,
  RecurrencePaymentRepository,
} from '../providers'

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
 * - a recurrence that no longer exists, was paused after the job was scheduled,
 *   or is already past its deadline, does nothing;
 * - the write is one composed operation on the port, and the transaction it
 *   posts is unique per (recurrence, day), so re-running a month already posted
 *   writes nothing and still moves the schedule forward.
 *
 * For a VARIABLE bill the amount posted is the one the owner wrote down for
 * that month if the bill already arrived, and the estimate otherwise — posting
 * the estimate when the real figure is known would put a number on the month
 * that the owner had already corrected.
 */
export default class RunRecurrence implements UseCase<Input, void> {
  constructor(
    private readonly repository: RecurrenceRepository,
    private readonly queue?: RecurrenceQueue,
    private readonly paymentRepository?: RecurrencePaymentRepository,
  ) {}

  async execute({ recurrenceId }: Input): Promise<void> {
    const recurrence = await this.repository.findById(recurrenceId)
    if (!recurrence || !recurrence.active) return

    const dueOn = recurrence.dueOn
    // Past its deadline the recurrence simply stops: nothing is posted and
    // nothing is scheduled, so the chain ends itself instead of needing anyone
    // to remember to pause a bill that already finished.
    if (recurrence.endedBy(dueOn)) return
    const transaction = new Transaction({
      ownerId: recurrence.ownerId,
      type: recurrence.type,
      categoryId: recurrence.categoryId,
      description: recurrence.description,
      amount: await this.amountFor(recurrence.variableAmount, recurrenceId, dueOn, recurrence.amount.cents),
      occurredOn: dueOn,
      recurrenceId: recurrence.id.value,
      bankId: recurrence.bankId,
      cardId: recurrence.cardId,
      paymentMethod: recurrence.paymentMethod,
    })

    recurrence.markPosted()
    await this.repository.postOccurrence(transaction, recurrence)
    // The month just posted may have been the last one — scheduling a job that
    // would only no-op is waste the queue does not need.
    if (!recurrence.endedBy(recurrence.dueOn)) {
      await this.queue?.scheduleRun({ recurrenceId: recurrence.id.value, at: recurrence.nextRunAt })
    }
  }

  private async amountFor(
    variableAmount: boolean,
    recurrenceId: string,
    dueOn: Date,
    estimateCents: number,
  ): Promise<number> {
    if (!variableAmount || !this.paymentRepository) return estimateCents
    const payment = await this.paymentRepository.findByRecurrenceAndPeriod(
      recurrenceId,
      MonthPeriod.of(dueOn).value,
    )
    return payment?.amount?.cents ?? estimateCents
  }
}
