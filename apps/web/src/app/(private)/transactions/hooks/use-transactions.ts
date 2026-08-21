'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { RecordTransactionInput, TransactionDTO } from '@transaction/adapters'
import { api } from '@/lib/api'
import { toPeriod } from '@/lib/date'
import { notify } from '@/lib/notify'
import { useCategories } from '@/hooks/use-categories'
import type { TransactionFilterValue } from '../data/transaction-filters'

export function useTransactions() {
  const queryClient = useQueryClient()
  const { pathOf } = useCategories()
  const [period, setPeriod] = useState(() => toPeriod())
  const [filter, setFilter] = useState<TransactionFilterValue>('all')
  const [pendingDeletion, setPendingDeletion] = useState<TransactionDTO | null>(null)

  const query = useQuery({
    queryKey: ['transactions', period, filter],
    queryFn: async (): Promise<TransactionDTO[]> =>
      (
        await api.get<TransactionDTO[]>('/transaction', {
          params: { period, type: filter === 'all' ? undefined : filter },
        })
      ).data,
  })

  // A movement changes the month's totals and can trip a ceiling, so the report
  // and the budgets are invalidated alongside the list itself.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
  }

  const record = useMutation({
    mutationFn: async (input: RecordTransactionInput) => {
      await api.post('/transaction', input)
    },
    onSuccess: () => {
      notify.success('Lançamento registrado.')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível registrar o lançamento.'),
  })

  const remove = useMutation({
    mutationFn: async (transactionId: string) => {
      await api.delete(`/transaction/${transactionId}`)
    },
    onSuccess: () => {
      notify.success('Lançamento excluído.')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível excluir o lançamento.'),
  })

  return {
    period,
    setPeriod,
    filter,
    setFilter,
    transactions: query.data ?? [],
    loading: query.isLoading,
    record: record.mutate,
    recording: record.isPending,
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      remove.mutate(pendingDeletion.id)
      setPendingDeletion(null)
    },
    labelFor: (categoryId: string | null) => (categoryId ? pathOf(categoryId) : 'Sem categoria'),
  }
}
