import type { NotificationType } from '@notification/adapters'
import { SEMANTIC } from './tokens'

/**
 * The colour that says what KIND of news a notification is, before anyone reads
 * it. It lives with the tokens because that is what it resolves to — a
 * notification is never painted in a colour the design system does not own.
 *
 * Mapped from the domain's own type union, so adding a notification type fails
 * the build here instead of silently rendering colourless.
 */
const ACCENTS: Record<NotificationType, string> = {
  budget_warning: SEMANTIC.warning,
  budget_exceeded: SEMANTIC.negative,
  recurrence_posted: SEMANTIC.accent,
  account_approved: SEMANTIC.positive,
  // The only one without a money meaning — it is an errand for the admin, not
  // news about someone's month.
  admin_signup_pending: '#a78bfa',
}

export function accentFor(type: NotificationType): string {
  return ACCENTS[type] ?? '#6d8096'
}
