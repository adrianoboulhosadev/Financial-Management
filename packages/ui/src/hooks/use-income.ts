'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IncomeSourceDTO, MonthlyIncomeDTO } from '@income/adapters'
import { api } from '../http/api'
import { errorMessage } from '../http/errors'
import { clientConfig } from '../config'

/** The recurring income (the salary) and the monthly total it adds up to.
 * Income feeds "how much is left", so every write invalidates the report too. */
export function useIncome() {
  const queryClient = useQueryClient()
  const { notifier } = clientConfig()

  const sources = useQuery({
    queryKey: ['income', 'sources'],
    queryFn: async (): Promise<IncomeSourceDTO[]> =>
      (await api().get<IncomeSourceDTO[]>('/income')).data,
  })

  const monthly = useQuery({
    queryKey: ['income', 'monthly'],
    queryFn: async (): Promise<MonthlyIncomeDTO> =>
      (await api().get<MonthlyIncomeDTO>('/income/monthly')).data,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['income'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
  }

  const create = useMutation({
    mutationFn: async (input: { name: string; amount: number; payday: number }) => {
      await api().post('/income', input)
    },
    onSuccess: () => {
      notifier.success('Fonte de renda adicionada.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível adicionar a fonte de renda.')),
  })

  const setActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await api().post(`/income/${id}/active`, { active })
    },
    onSuccess: invalidate,
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível atualizar a fonte de renda.')),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api().delete(`/income/${id}`)
    },
    onSuccess: () => {
      notifier.success('Fonte de renda excluída.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível excluir a fonte de renda.')),
  })

  return {
    sources: sources.data ?? [],
    monthlyTotal: monthly.data?.totalCents ?? 0,
    loading: sources.isLoading,
    create: create.mutate,
    creating: create.isPending,
    toggleActive: (source: IncomeSourceDTO) =>
      setActive.mutate({ id: source.id, active: !source.active }),
    remove: remove.mutate,
  }
}
