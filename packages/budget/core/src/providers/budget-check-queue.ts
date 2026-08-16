export interface BudgetCheckCommand {
  ownerId: string
  categoryId: string
  // YYYY-MM — the month the movement was filed under, so a expense backdated to
  // last month is checked against LAST month's spending, not this one's.
  period: string
}

/**
 * Queue port that asks for a budget to be re-checked after money was spent on
 * its category. The backend implements it with a BullMQ job and the worker
 * consumes it (running EvaluateBudgetAlert and writing the notification).
 *
 * It is a QUEUE and not an inline check on purpose: recording an expense must
 * not get slower — or worse, fail — because a notification could not be
 * written. The queue/job name literals must match between producer and consumer.
 */
export interface BudgetCheckQueue {
  enqueueCheck(command: BudgetCheckCommand): Promise<void>
}
