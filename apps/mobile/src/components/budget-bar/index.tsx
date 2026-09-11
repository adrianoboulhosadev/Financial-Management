import { View } from 'react-native'
import type { BudgetStatus } from '@budget/adapters'
import { BUDGET_STATUS_CLASSES } from 'ui'

interface BudgetBarProps {
  percentage: number
  status: BudgetStatus
  /** The thinner track, for a bar that summarises rather than compares. */
  slim?: boolean
}

export function BudgetBar({ percentage, status, slim = false }: BudgetBarProps) {
  return (
    <View className={`w-full overflow-hidden rounded-full bg-ink-border ${slim ? 'h-[5px]' : 'h-1.5'}`}>
      {/* Capped at 100% so a blown ceiling does not paint outside the track —
          how far past it went is the number next to the bar's job. */}
      <View
        className={`h-full ${BUDGET_STATUS_CLASSES[status]}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </View>
  )
}
