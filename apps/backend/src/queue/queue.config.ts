import IORedis from 'ioredis'

/**
 * Queue names and job names, shared by the producer (this app) and the consumer
 * (apps/worker). These literals MUST match on both sides — BullMQ has no way to
 * warn you that a job is being pushed to a queue nobody listens to, so the two
 * copies are the contract.
 */
export const RECURRENCE_QUEUE = 'recurrence'
export const RECURRENCE_JOB = 'run'

export const BUDGET_CHECK_QUEUE = 'budget-check'
export const BUDGET_CHECK_JOB = 'check'

export const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379'

/** BullMQ requires maxRetriesPerRequest: null on its connections. */
export function createQueueConnection(): IORedis {
  return new IORedis(REDIS_URL, { maxRetriesPerRequest: null })
}
