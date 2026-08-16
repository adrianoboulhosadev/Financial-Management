import { NotificationInput } from '@notification/adapters'
import { BudgetUsageDTO } from '@budget/adapters'

/**
 * Turns a budget crossing into the inbox line that warns about it. PURE — it
 * only describes the notification, it never writes one — so it is testable
 * without a database and the actual writing stays behind the notification
 * facade, which is what builds the entity (and owns the copy).
 *
 * The `referenceId` is what keeps the inbox quiet: it pins the notice to
 * (ceiling, month, severity), so every further expense in an already-blown month
 * rebuilds the same key and writes nothing. Crossing 80% and then 100% in the
 * same month are DIFFERENT keys, so the second one still gets through — which is
 * the point, since it is worse news.
 *
 * `null` when there is nothing to say. A status of `ok` never reaches here (the
 * use case answers null first), so this only closes the type.
 */
export function notificationFor(
  usage: BudgetUsageDTO,
  ownerId: string,
  categoryName: string,
  period: string,
): NotificationInput | null {
  const referenceId = `${usage.budgetId}:${period}:${usage.status}`

  if (usage.status === 'exceeded') {
    return {
      userId: ownerId,
      type: 'budget_exceeded',
      categoryName,
      limitCents: usage.limitCents,
      spentCents: usage.spentCents,
      referenceId,
    }
  }

  if (usage.status === 'warning') {
    return {
      userId: ownerId,
      type: 'budget_warning',
      categoryName,
      limitCents: usage.limitCents,
      spentCents: usage.spentCents,
      percentage: usage.percentage,
      referenceId,
    }
  }

  return null
}
