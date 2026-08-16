import IORedis from 'ioredis'
import { REDIS_URL } from './queue/queue.config'

/** One channel per recipient — the literal MUST match the backend's
 * `channelFor` (notification/live-updates.ts), or the ping is published where
 * nobody is listening. */
function channelFor(userId: string): string {
  return `notifications-${userId}`
}

const publisher = new IORedis(REDIS_URL, { maxRetriesPerRequest: null })

/**
 * Tells whichever backend instance holds this user's SSE connection that their
 * inbox changed. Best-effort by design: the notification is already committed,
 * so a failed ping only costs the live refresh (the client still sees it on its
 * next read), never the notification itself.
 *
 * Always called AFTER the transaction commits — pinging from inside it could
 * make the client re-read before the rows are visible, or announce something a
 * rollback then erased.
 */
export async function pushLiveUpdates(userIds: string[]): Promise<void> {
  await Promise.all(
    [...new Set(userIds)].map(async (userId) => {
      try {
        await publisher.publish(channelFor(userId), '1')
      } catch (error) {
        console.warn(`failed to push a live update to ${userId}: ${String(error)}`)
      }
    }),
  )
}

export async function closeLiveUpdates(): Promise<void> {
  await publisher.quit()
}
