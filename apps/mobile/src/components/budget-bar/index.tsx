import { View } from 'react-native'
import type { BudgetStatus } from '@budget/adapters'
import { BUDGET_STATUS_CLASSES } from 'ui'

interface BudgetBarProps {
  percentage: number
  status: BudgetStatus
}

export function BudgetBar({ percentage, status }: BudgetBarProps) {
  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-ink-surface-soft">
      {/* Capped at 100% so a blown ceiling does not paint outside the track —
          how far past it went is the number next to the bar's job. */}
      <View
        className={`h-full rounded-full ${BUDGET_STATUS_CLASSES[status]}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </View>
  )
}
