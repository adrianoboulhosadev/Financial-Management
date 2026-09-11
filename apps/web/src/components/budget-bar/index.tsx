import type { BudgetStatus } from '@budget/adapters'
import { BUDGET_STATUS_CLASSES } from 'ui'

interface BudgetBarProps {
  percentage: number
  status: BudgetStatus
  /** The thinner track, for a bar that summarises rather than compares — the
   * checklist's "how much of the month is settled". */
  slim?: boolean
}

export function BudgetBar({ percentage, status, slim = false }: BudgetBarProps) {
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-ink-border ${slim ? 'h-[5px]' : 'h-1.5'}`}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Capped at 100% so a blown ceiling does not paint outside the track —
          how far past it went is the number next to the bar's job. */}
      <div
        className={`h-full transition-all ${BUDGET_STATUS_CLASSES[status]}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}
