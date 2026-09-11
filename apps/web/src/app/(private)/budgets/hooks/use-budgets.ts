'use client'

import { useState } from 'react'
import type { BudgetUsageDTO } from '@budget/adapters'

import {
  toCents,
  toPeriod,
  useBudgets as useBudgetsData,
  useCategories,
  useMonthlyReport,
} from 'ui'

export function useBudgets() {
  const [period, setPeriod] = useState(() => toPeriod())
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<BudgetUsageDTO | null>(null)
  const [composing, setComposing] = useState(false)
  const { pathOf } = useCategories()

  const data = useBudgetsData(period)
  // The report is what knows where money actually went, which is the only way
  // to answer "what am I spending on without a ceiling on it".
  const { report } = useMonthlyReport(period)

  const capped = new Set(data.usages.map((usage) => usage.categoryId))
  /** Categories the month spent on that nobody has capped. It is the whole
   * reason the screen is worth reopening: the ceilings you have are already
   * being watched, and these are the ones you have not thought about yet. */
  const uncapped = (report?.byCategory ?? [])
    .filter((total) => total.categoryId !== null && !capped.has(total.categoryId))
    .map((total) => ({
      categoryId: total.categoryId as string,
      spentCents: total.spentCents,
    }))

  const limitCents = data.usages.reduce((sum, usage) => sum + usage.limitCents, 0)
  const spentCents = data.usages.reduce((sum, usage) => sum + usage.spentCents, 0)

  const openComposer = (preselected = '') => {
    setCategoryId(preselected)
    setAmount('')
    setComposing(true)
  }

  return {
    period,
    setPeriod,
    usages: data.usages,
    uncapped,
    loading: data.loading,
    /** The month's ceilings as ONE ceiling: what all of them allow, and how
     * much of it is gone. It is the figure the screen leads with, because a
     * list of six bars answers six questions and none of them is "am I ok". */
    limitCents,
    spentCents,
    cappedPercentage: limitCents > 0 ? Math.round((spentCents / limitCents) * 100) : 0,
    remainingCents: limitCents - spentCents,
    /** How many days the month still has to cover with what is left. Only
     * meaningful for the CURRENT month — a closed month has no days left to
     * budget for, and saying "restam 21 dias" about August in October would be
     * nonsense. */
    daysLeft: (() => {
      if (period !== toPeriod()) return null
      const now = new Date()
      const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate()
      return lastDay - now.getUTCDate()
    })(),
    composing,
    openComposer,
    closeComposer: () => setComposing(false),
    categoryId,
    setCategoryId,
    amount,
    setAmount,
    save: () => {
      data.save({ categoryId, amount: toCents(amount) })
      setAmount('')
      setCategoryId('')
      setComposing(false)
    },
    saving: data.saving,
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
