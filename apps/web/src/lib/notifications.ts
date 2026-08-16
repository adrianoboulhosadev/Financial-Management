import type { NotificationType } from '@notification/adapters'

/**
 * The colour that says what KIND of news a notification is, before anyone reads
 * it. Mapped from the domain's own type union, so a new type fails the build
 * here instead of silently rendering colourless.
 */
const ACCENTS: Record<NotificationType, string> = {
  budget_warning: '#fbbf24',
  budget_exceeded: '#f87171',
  recurrence_posted: '#4f9cf9',
  account_approved: '#34d399',
  admin_signup_pending: '#a78bfa',
}

export function accentFor(type: NotificationType): string {
  return ACCENTS[type] ?? '#6d8096'
}
