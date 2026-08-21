import { useState } from 'react'
import type { BudgetUsageDTO } from '@budget/adapters'
import { toCents, toPeriod } from 'ui'
import { useBudgets, useCategories } from 'client'

export function useBudgetsScreen() {
  const [period, setPeriod] = useState(() => toPeriod())
  const [formOpen, setFormOpen] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<BudgetUsageDTO | null>(null)
  const { pathOf } = useCategories()

  const data = useBudgets(period)

  return {
    period,
    setPeriod,
    usages: data.usages,
    loading: data.loading,
    saving: data.saving,
    formOpen,
    openForm: () => setFormOpen(true),
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
