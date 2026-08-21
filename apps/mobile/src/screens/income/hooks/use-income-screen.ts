import { useState } from 'react'
import type { IncomeSourceDTO } from '@income/adapters'
import { toCents } from 'ui'
import { useIncome } from 'client'

export function useIncomeScreen() {
  const data = useIncome()
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [payday, setPayday] = useState('5')
  const [pendingDeletion, setPendingDeletion] = useState<IncomeSourceDTO | null>(null)

  return {
    sources: data.sources,
    monthlyTotal: data.monthlyTotal,
    loading: data.loading,
    creating: data.creating,
    formOpen,
    openForm: () => setFormOpen(true),
    closeForm: () => setFormOpen(false),
    name,
    setName,
    amount,
    setAmount,
    payday,
    setPayday,
    canSubmit: Boolean(name.trim() && amount),
    submit: () => {
      data.create({ name, amount: toCents(amount), payday: Number(payday) })
      setFormOpen(false)
      setName('')
      setAmount('')
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
  }
}
