import { useState } from 'react'
import type { BudgetUsageDTO } from '@budget/adapters'

import { toCents, toPeriod, useBudgets, useCategories, useMonthlyReport } from 'ui'

export function useBudgetsScreen() {
  const [period, setPeriod] = useState(() => toPeriod())
  const [formOpen, setFormOpen] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<BudgetUsageDTO | null>(null)
  const { pathOf } = useCategories()

  const data = useBudgets(period)
  // The report is what knows where money actually went, which is the only way
  // to answer "what am I spending on without a ceiling on it".
  const { report } = useMonthlyReport(period)

  const capped = new Set(data.usages.map((usage) => usage.categoryId))
  /** Categories the month spent on that nobody has capped — the whole reason
   * the screen is worth reopening. */
  const uncapped = (report?.byCategory ?? [])
    .filter((total) => total.categoryId !== null && !capped.has(total.categoryId))
    .map((total) => ({ categoryId: total.categoryId as string, spentCents: total.spentCents }))

  const limitCents = data.usages.reduce((sum, usage) => sum + usage.limitCents, 0)
  const spentCents = data.usages.reduce((sum, usage) => sum + usage.spentCents, 0)

  return {
    period,
    setPeriod,
    usages: data.usages,
    uncapped,
    loading: data.loading,
    saving: data.saving,
    /** The month's ceilings as ONE ceiling: what all of them allow, and how
     * much of it is gone. */
    limitCents,
    spentCents,
    cappedPercentage: limitCents > 0 ? Math.round((spentCents / limitCents) * 100) : 0,
    remainingCents: limitCents - spentCents,
    /** How many days the month still has to cover with what is left. Only
     * meaningful for the CURRENT month — a closed month has no days left. */
    daysLeft: (() => {
      if (period !== toPeriod()) return null
      const now = new Date()
      const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate()
      return lastDay - now.getUTCDate()
    })(),
    formOpen,
    openForm: (preselected = '') => {
      setCategoryId(preselected)
      setAmount('')
      setFormOpen(true)
    },
    closeForm: () => setFormOpen(false),
    categoryId,
    setCategoryId,
    amount,
    setAmount,
    canSubmit: Boolean(categoryId && amount),
    submit: () => {
      data.save({ categoryId, amount: toCents(amount) })
      setFormOpen(false)
      setAmount('')
      setCategoryId('')
    },
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      data.remove(pendingDeletion.budgetId)
      setPendingDeletion(null)
    },
    labelFor: (id: string) => pathOf(id),
  }
}
