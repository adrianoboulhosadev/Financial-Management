'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BudgetUsageDTO } from '@budget/adapters'
import { api } from '../http/api'
import { errorMessage } from '../http/errors'
import { clientConfig } from '../config'

/**
 * The ceilings WITH how much the month already ate — one read, so no screen has
 * to line up two lists by hand.
 */
export function useBudgets(period: string) {
  const queryClient = useQueryClient()
  const { notifier } = clientConfig()

  const query = useQuery({
    queryKey: ['budgets', 'usage', period],
    queryFn: async (): Promise<BudgetUsageDTO[]> =>
      (await api().get<BudgetUsageDTO[]>('/budget/usage', { params: { period } })).data,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
  }

  const save = useMutation({
    mutationFn: async (input: { categoryId: string; amount: number }) => {
      await api().post('/budget', input)
    },
    onSuccess: () => {
      notifier.success('Orçamento salvo.')
      invalidate()
    },
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível salvar o orçamento.')),
  })

  const remove = useMutation({
    mutationFn: async (budgetId: string) => {
      await api().delete(`/budget/${budgetId}`)
    },
    onSuccess: () => {
      notifier.success('Orçamento removido.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível remover o orçamento.')),
  })

  return {
    usages: query.data ?? [],
    loading: query.isLoading,
    save: save.mutate,
    saving: save.isPending,
    remove: remove.mutate,
  }
}
