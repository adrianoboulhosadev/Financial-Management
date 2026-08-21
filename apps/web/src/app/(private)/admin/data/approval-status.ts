import type { ApprovalStatus } from '@auth/adapters'

/** Como cada estado da portaria é escrito e pintado na tela. A união vem do
 * domínio (`User.approvalStatus`), então esta tabela só a rotula. */
export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  approved: 'Liberada',
  rejected: 'Bloqueada',
  pending: 'Aguardando',
}

export const APPROVAL_STATUS_CLASSES: Record<ApprovalStatus, string> = {
  approved: 'bg-positive/10 text-positive',
  rejected: 'bg-negative/10 text-negative',
  pending: 'bg-warning/10 text-warning',
}
