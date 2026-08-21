'use client'

import { useState } from 'react'
import type { IncomeSourceDTO } from '@income/adapters'

import { toCents, useIncome as useIncomeData } from 'ui'

export function useIncome() {
  const data = useIncomeData()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [payday, setPayday] = useState('5')
  const [pendingDeletion, setPendingDeletion] = useState<IncomeSourceDTO | null>(null)

  return {
    sources: data.sources,
    monthlyTotal: data.monthlyTotal,
    loading: data.loading,
    name,
    setName,
    amount,
    setAmount,
    payday,
    setPayday,
    create: () => {
      data.create({ name, amount: toCents(amount), payday: Number(payday) })
      setName('')
      setAmount('')
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
  }
}
