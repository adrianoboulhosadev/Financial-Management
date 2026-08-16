import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { Queue } from 'bullmq'
import { RecurrenceQueue, RecurrenceRunCommand } from '@transaction/adapters'
import { RECURRENCE_QUEUE, RECURRENCE_JOB, createQueueConnection } from '../queue/queue.config'

/**
 * Driven adapter of the RecurrenceQueue port: a DELAYED BullMQ job that fires
 * when the recurrence is due. The worker consumes it, posts the month and
 * schedules the next one through this same port.
 *
 * The job id is derived from (recurrence, due date), so re-scheduling the same
 * occurrence — an edit that did not move the date, a retried request — replaces
 * nothing and enqueues nothing extra. A duplicate that slips through anyway is
 * still harmless: RunRecurrence is idempotent.
 */
@Injectable()
export class BullMqRecurrenceQueue implements RecurrenceQueue, OnModuleDestroy {
  private readonly logger = new Logger(BullMqRecurrenceQueue.name)
  private readonly queue = new Queue(RECURRENCE_QUEUE, { connection: createQueueConnection() })

  async scheduleRun({ recurrenceId, at }: RecurrenceRunCommand): Promise<void> {
    // A due date already in the past means "run now" (delay 0) — never a
    // negative delay, which BullMQ would reject.
    const delay = Math.max(0, at.getTime() - Date.now())
    const dueDay = at.toISOString().slice(0, 10)

    await this.queue.add(
      RECURRENCE_JOB,
      { recurrenceId },
      { delay, jobId: `${recurrenceId}:${dueDay}`, removeOnComplete: true, removeOnFail: 100 },
    )
    this.logger.log(`recurrence ${recurrenceId} scheduled for ${dueDay}`)
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close()
  }
}
