import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { Queue } from 'bullmq'
import { BudgetCheckQueue, BudgetCheckCommand } from '@budget/adapters'
import { BUDGET_CHECK_QUEUE, BUDGET_CHECK_JOB, createQueueConnection } from '../queue/queue.config'

/**
 * Driven adapter of the BudgetCheckQueue port. Recording an expense enqueues
 * this instead of checking inline: the write path stays fast, and a budget
 * notification that cannot be produced never becomes a failed expense.
 *
 * No jobId here, on purpose — every expense really is a new event worth
 * re-checking, and the notification's own unique key is what stops the same
 * crossing from being announced twice.
 */
@Injectable()
export class BullMqBudgetCheckQueue implements BudgetCheckQueue, OnModuleDestroy {
  private readonly queue = new Queue(BUDGET_CHECK_QUEUE, { connection: createQueueConnection() })

  async enqueueCheck(command: BudgetCheckCommand): Promise<void> {
    await this.queue.add(BUDGET_CHECK_JOB, command, {
      removeOnComplete: true,
      removeOnFail: 100,
    })
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close()
  }
}
