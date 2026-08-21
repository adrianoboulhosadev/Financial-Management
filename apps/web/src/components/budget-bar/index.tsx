import type { BudgetStatus } from '@budget/adapters'
import { STATUS_CLASSES } from './data/status-classes'

interface BudgetBarProps {
  percentage: number
  status: BudgetStatus
}

export function BudgetBar({ percentage, status }: BudgetBarProps) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-ink-surface-soft"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Capped at 100% so a blown ceiling does not paint outside the track —
          how far past it went is the number next to the bar's job. */}
      <div
        className={`h-full rounded-full transition-all ${STATUS_CLASSES[status]}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}
