import * as dotenv from 'dotenv'
dotenv.config()

import { Worker } from 'bullmq'
import { TransactionFacade } from '@transaction/adapters'
import { BudgetFacade } from '@budget/adapters'
import { NotificationFacade } from '@notification/adapters'
import {
  RECURRENCE_QUEUE,
  BUDGET_CHECK_QUEUE,
  createQueueConnection,
  RecurrenceJobData,
  BudgetCheckJobData,
} from './queue/queue.config'
import { WorkerRecurrenceRepository } from './persistence/worker-recurrence-repository'
import {
  WorkerTransactionQueryRepository,
  WorkerBudgetQueryRepository,
  WorkerNotificationRepository,
  categoryNameOf,
} from './persistence/worker-query-repositories'
import { BullMqRecurrenceQueue } from './recurrence/bullmq-recurrence-queue'
import { notificationFor as budgetNotificationFor } from './budget/budget-notifications'
import { pushLiveUpdates, closeLiveUpdates } from './live-updates'

/**
 * The asynchronous half of the product. Two queues, for the two things that
 * must not happen on the request path:
 *
 * - `recurrence`: a DELAYED job per fixed monthly movement. When it fires, the
 *   month is posted and the NEXT month is scheduled through the same port, so
 *   the chain keeps itself going with no cron and no scan of the table.
 * - `budget-check`: fired after an expense. It re-adds the month, asks the
 *   domain whether the ceiling is now worth mentioning, and files the notice.
 *   Out here so that recording an expense never gets slower — or fails —
 *   because a notification could not be written.
 */

const recurrenceRepository = new WorkerRecurrenceRepository()
const recurrenceQueue = new BullMqRecurrenceQueue()
const transactionQueries = new WorkerTransactionQueryRepository()
const budgetQueries = new WorkerBudgetQueryRepository()
const notificationRepository = new WorkerNotificationRepository()

const recurrenceWorker = new Worker<RecurrenceJobData>(
  RECURRENCE_QUEUE,
  async (job) => {
    const { recurrenceId } = job.data
    // The facade posts the movement, advances the schedule and files the
    // "posted" notification in ONE transaction (see WorkerRecurrenceRepository),
    // then schedules next month through the queue port.
    const facade = new TransactionFacade(
      undefined,
      undefined,
      recurrenceRepository,
      undefined,
      recurrenceQueue,
    )
    await facade.runRecurrence(recurrenceId)

    // After the commit, never inside it: a ping for rows a rollback erased
    // would send the client looking for something that is not there.
    const recurrence = await recurrenceRepository.findById(recurrenceId)
    if (recurrence) await pushLiveUpdates([recurrence.ownerId])
  },
  { connection: createQueueConnection() },
)

const budgetCheckWorker = new Worker<BudgetCheckJobData>(
  BUDGET_CHECK_QUEUE,
  async (job) => {
    const { ownerId, categoryId, period } = job.data

    const spentCents = await new TransactionFacade(undefined, transactionQueries).getSpentByCategory(
      ownerId,
      categoryId,
      period,
    )
    const usage = await new BudgetFacade(undefined, budgetQueries).evaluateBudgetAlert(
      ownerId,
      categoryId,
      spentCents,
    )
    // Nothing worth saying — the common case, and it costs one query.
    if (!usage) return

    const item = budgetNotificationFor(usage, ownerId, await categoryNameOf(categoryId), period)
    if (!item) return

    // A plain write, not a transaction: unlike the recurrence, nothing else is
    // being written here, so there is nothing for it to be atomic WITH. Filing
    // the same crossing twice is already a no-op (see the referenceId).
    await new NotificationFacade(notificationRepository).send([item])
    await pushLiveUpdates([ownerId])
  },
  { connection: createQueueConnection() },
)

for (const [name, worker] of [
  [RECURRENCE_QUEUE, recurrenceWorker],
  [BUDGET_CHECK_QUEUE, budgetCheckWorker],
] as const) {
  worker.on('failed', (job, error) => {
    console.error(`[${name}] job ${job?.id} failed: ${error.message}`)
  })
}

console.log(`worker listening on the "${RECURRENCE_QUEUE}" and "${BUDGET_CHECK_QUEUE}" queues`)

async function shutdown(): Promise<void> {
  await Promise.all([recurrenceWorker.close(), budgetCheckWorker.close(), recurrenceQueue.close()])
  await closeLiveUpdates()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
