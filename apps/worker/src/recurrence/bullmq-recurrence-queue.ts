import { Queue } from 'bullmq'
import { RecurrenceQueue, RecurrenceRunCommand } from '@transaction/adapters'
import { RECURRENCE_QUEUE, RECURRENCE_JOB, createQueueConnection } from '../queue/queue.config'

/**
 * The worker's own producer of the RecurrenceQueue port — the same adapter the
 * backend has, and it needs its own because a recurrence SCHEDULES ITSELF: after
 * posting a month, RunRecurrence asks this port for the next one, which is what
 * keeps the chain going without a cron or a nightly scan of the table.
 *
 * The job id is derived from (recurrence, due date), so the same occurrence is
 * never queued twice — and a duplicate that slipped through anyway would still
 * be harmless, since RunRecurrence is idempotent.
 *
 * The separator is `_` and never `:`: BullMQ namespaces its own Redis keys with
 * `:` and rejects a custom job id containing one ("Custom Id cannot contain :"),
 * which used to fail EVERY recurrence creation with a 500.
 */
export class BullMqRecurrenceQueue implements RecurrenceQueue {
  private readonly queue = new Queue(RECURRENCE_QUEUE, { connection: createQueueConnection() })

  async scheduleRun({ recurrenceId, at }: RecurrenceRunCommand): Promise<void> {
    // A due date already in the past means "run now" (delay 0) — never a
    // negative delay, which BullMQ would reject.
    const delay = Math.max(0, at.getTime() - Date.now())
    const dueDay = at.toISOString().slice(0, 10)

    await this.queue.add(
      RECURRENCE_JOB,
      { recurrenceId },
      { delay, jobId: `${recurrenceId}_${dueDay}`, removeOnComplete: true, removeOnFail: 100 },
    )
  }

  async close(): Promise<void> {
    await this.queue.close()
  }
}
