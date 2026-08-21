import { useState } from 'react'
import type { TransactionDTO, TransactionType } from '@transaction/adapters'
import { toCents, toDateInputValue, toPeriod, type TransactionFilterValue } from 'ui'
import { useCategories, useTransactions } from 'client'

/**
 * The screen's own state (which month, which filter, the form, what is about to
 * be deleted) composed with the shared data hook — the same split the web makes.
 */
export function useTransactionsScreen() {
  const [period, setPeriod] = useState(() => toPeriod())
  const [filter, setFilter] = useState<TransactionFilterValue>('all')
  const [pendingDeletion, setPendingDeletion] = useState<TransactionDTO | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [occurredOn, setOccurredOn] = useState(() => toDateInputValue())
  const { pathOf } = useCategories()

  const data = useTransactions({ period, type: filter === 'all' ? undefined : filter })

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setCategoryId('')
    setOccurredOn(toDateInputValue())
  }

  return {
    period,
    setPeriod,
    filter,
    setFilter,
    transactions: data.transactions,
    loading: data.loading,
    recording: data.recording,
    formOpen,
    openForm: () => setFormOpen(true),
    closeForm: () => {
      setFormOpen(false)
      resetForm()
    },
    type,
    setType,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    amount,
    setAmount,
    occurredOn,
    setOccurredOn,
    // Only an expense must land on a category — that is the tree's whole point.
    categoryRequired: type === 'expense',
    canSubmit: Boolean(description.trim() && amount && (type !== 'expense' || categoryId)),
    submit: () => {
      data.record({
        type,
        categoryId: categoryId || null,
        description,
        amount: toCents(amount),
        occurredOn,
      })
      setFormOpen(false)
      resetForm()
    },
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      data.remove(pendingDeletion.id)
      setPendingDeletion(null)
    },
    labelFor: (categoryId: string | null) => (categoryId ? pathOf(categoryId) : 'Sem categoria'),
  }
}
