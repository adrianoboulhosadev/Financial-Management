'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BudgetUsageDTO } from '@budget/adapters'
import { api } from '@/lib/api'
import { toCents } from '@/lib/money'
import { toPeriod } from '@/lib/date'
import { notify } from '@/lib/notify'
import { useCategories } from '@/hooks/use-categories'

export function useBudgets() {
  const queryClient = useQueryClient()
  const { pathOf } = useCategories()
  const [period, setPeriod] = useState(() => toPeriod())
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<BudgetUsageDTO | null>(null)

  // The usage (ceiling + what the month ate) is one read, so the screen never
  // has to line up two lists by hand.
  const query = useQuery({
    queryKey: ['budgets', 'usage', period],
    queryFn: async (): Promise<BudgetUsageDTO[]> =>
      (await api.get<BudgetUsageDTO[]>('/budget/usage', { params: { period } })).data,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
  }

  const save = useMutation({
    mutationFn: async () => {
      await api.post('/budget', { categoryId, amount: toCents(amount) })
    },
    onSuccess: () => {
      notify.success('Orçamento salvo.')
      setAmount('')
      setCategoryId('')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível salvar o orçamento.'),
  })

  const remove = useMutation({
    mutationFn: async (budgetId: string) => {
      await api.delete(`/budget/${budgetId}`)
    },
    onSuccess: () => {
      notify.success('Orçamento removido.')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível remover o orçamento.'),
  })

  return {
    period,
    setPeriod,
    usages: query.data ?? [],
    loading: query.isLoading,
    categoryId,
    setCategoryId,
    amount,
    setAmount,
    save: () => save.mutate(),
    saving: save.isPending,
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      remove.mutate(pendingDeletion.budgetId)
      setPendingDeletion(null)
    },
    labelFor: (id: string) => pathOf(id),
  }
}
