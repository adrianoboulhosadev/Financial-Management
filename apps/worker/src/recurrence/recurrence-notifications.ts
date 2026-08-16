import { Notification, NotificationInput } from '@notification/adapters'
import { Transaction } from '@transaction/adapters'

/**
 * Turns a posted occurrence into the inbox line that announces it. PURE — it
 * only builds, it never writes — which is what makes it testable without a
 * database and reusable inside the very transaction that posts the movement.
 *
 * `referenceId` is the transaction's own id: a job redelivered for the same
 * month rebuilds the SAME id, so the notification's (userId, type, referenceId)
 * unique key turns the second delivery into a no-op instead of a duplicate line.
 */
export function notificationFor(transaction: Transaction): Notification {
  const input: NotificationInput = {
    userId: transaction.ownerId,
    type: 'recurrence_posted',
    description: transaction.description,
    amount: transaction.amount.cents,
    movement: transaction.type,
    referenceId: transaction.id.value,
  }
  return Notification.for(input)
}
