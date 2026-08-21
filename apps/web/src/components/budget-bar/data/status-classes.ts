import type { BudgetStatus } from '@budget/adapters'

/**
 * A cor de cada estado do teto. A união NÃO é declarada aqui: `BudgetStatus`
 * vem do domínio (BudgetUsageCalculator), então a barra nunca decide por conta
 * própria o que é "quase estourando" — só pinta o que o domínio classificou.
 */
export const STATUS_CLASSES: Record<BudgetStatus, string> = {
  ok: 'bg-positive',
  warning: 'bg-warning',
  exceeded: 'bg-negative',
}
