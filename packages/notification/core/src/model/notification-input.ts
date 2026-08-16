export const NOTIFICATION_TYPES = [
  // owner — a ceiling is running out, or is already gone
  'budget_warning',
  'budget_exceeded',
  // owner — a fixed monthly movement was posted on their behalf
  'recurrence_posted',
  // owner — the front door
  'account_approved',
  // admin — someone is waiting at the gate
  'admin_signup_pending',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

/** Which way a posted recurrence moved the money. Kept as its own tiny union
 * instead of importing transaction's TransactionType — notification touches no
 * other context. */
export type NotificationMovement = 'expense' | 'income'

interface Recipient {
  /** Who receives it. A logical FK to users — notification owns no identity. */
  userId: string
  /** The thing that caused it (a budget crossing, a posted recurrence, …).
   * Together with (userId, type) it is what makes delivery IDEMPOTENT — see the
   * repository. */
  referenceId?: string | null
}

/**
 * Everything needed to WRITE a notification, one shape per type (discriminated
 * union): each event carries only the facts its copy actually uses, so a caller
 * cannot forget the amount of a crossing or invent a field.
 * `Notification.for` turns one of these into the finished entity.
 *
 * The category is passed by NAME, already resolved by whoever raises the event
 * (the worker looks it up once per check): a notification records what was said
 * at the time, and an id would render as gibberish in an inbox line.
 */
export type NotificationInput =
  | (Recipient & {
      type: 'budget_warning'
      categoryName: string
      limitCents: number
      spentCents: number
      percentage: number
    })
  | (Recipient & {
      type: 'budget_exceeded'
      categoryName: string
      limitCents: number
      spentCents: number
    })
  | (Recipient & {
      type: 'recurrence_posted'
      description: string
      amount: number
      movement: NotificationMovement
    })
  | (Recipient & { type: 'account_approved' })
  | (Recipient & { type: 'admin_signup_pending'; signupEmail: string })
