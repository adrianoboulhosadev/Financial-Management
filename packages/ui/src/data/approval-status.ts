import type { ApprovalStatus } from '@auth/adapters'

/** How each state of the front door is written and painted. The union comes
 * from the domain (`User.approvalStatus`), so this only labels it. */
export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  approved: 'Liberada',
  rejected: 'Bloqueada',
  pending: 'Aguardando',
}

/**
 * Shared because these are the same Tailwind class names on both platforms —
 * NativeWind reads `bg-positive/10 text-positive` exactly like the browser
 * does, and they resolve through the shared preset to the same colour.
 */
export const APPROVAL_STATUS_CLASSES: Record<ApprovalStatus, string> = {
  approved: 'bg-positive/10 text-positive',
  rejected: 'bg-negative/10 text-negative',
  pending: 'bg-warning/10 text-warning',
}
