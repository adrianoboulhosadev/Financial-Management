import { useState } from 'react'
import type { RecurrenceDTO, TransactionType } from '@transaction/adapters'
import { toCents } from 'ui'
import { useCategories, useRecurrences } from 'client'

export function useRecurrencesScreen() {
  const data = useRecurrences()
  const { pathOf } = useCategories()
  const [formOpen, setFormOpen] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('5')
  const [pendingDeletion, setPendingDeletion] = useState<RecurrenceDTO | null>(null)

  return {
    recurrences: data.recurrences,
    loading: data.loading,
    creating: data.creating,
    formOpen,
    openForm: () => setFormOpen(true),
    closeForm: () => setFormOpen(false),
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
    categoryRequired: type === 'expense',
    canSubmit: Boolean(description.trim() && amount && (type !== 'expense' || categoryId)),
    submit: () => {
      data.create({
        type,
        categoryId: categoryId || null,
        description,
        amount: toCents(amount),
        dayOfMonth: Number(dayOfMonth),
      })
      setFormOpen(false)
      setDescription('')
      setAmount('')
      setCategoryId('')
    },
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
