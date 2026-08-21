'use client'

import { useState } from 'react'
import type { RecurrenceDTO, TransactionType } from '@transaction/adapters'
import { toCents } from 'ui'
import { useCategories, useRecurrences as useRecurrencesData } from 'client'

export function useRecurrences() {
  const data = useRecurrencesData()
  const { pathOf } = useCategories()
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('5')
  const [pendingDeletion, setPendingDeletion] = useState<RecurrenceDTO | null>(null)

  return {
    recurrences: data.recurrences,
    loading: data.loading,
    type,
    setType,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    amount,
    setAmount,
    dayOfMonth,
    setDayOfMonth,
    // Only an expense must land on a category, same rule as a one-off movement.
    categoryRequired: type === 'expense',
    create: () => {
      data.create({
        type,
        categoryId: categoryId || null,
        description,
        amount: toCents(amount),
        dayOfMonth: Number(dayOfMonth),
      })
      setDescription('')
      setAmount('')
      setCategoryId('')
    },
    creating: data.creating,
    toggleActive: data.toggleActive,
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      data.remove(pendingDeletion.id)
      setPendingDeletion(null)
    },
    labelFor: (id: string | null) => (id ? pathOf(id) : 'Sem categoria'),
  }
}
