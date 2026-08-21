'use client'

import { useState } from 'react'
import type { BudgetUsageDTO } from '@budget/adapters'

import { toCents, toPeriod, useBudgets as useBudgetsData, useCategories } from 'ui'

export function useBudgets() {
  const [period, setPeriod] = useState(() => toPeriod())
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<BudgetUsageDTO | null>(null)
  const { pathOf } = useCategories()

  const data = useBudgetsData(period)

  return {
    period,
    setPeriod,
    usages: data.usages,
    loading: data.loading,
    categoryId,
    setCategoryId,
    amount,
    setAmount,
    save: () => {
      data.save({ categoryId, amount: toCents(amount) })
      setAmount('')
      setCategoryId('')
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
