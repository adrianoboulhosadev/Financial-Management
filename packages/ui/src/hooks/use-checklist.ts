'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MonthlyChecklistDTO } from '@transaction/adapters'
import { api } from '../http/api'
import { errorMessage } from '../http/errors'
import { clientConfig } from '../config'

/**
 * The month's to-do list of fixed bills: what is still to pay, what a variable
 * bill actually came to, and what has been ticked off.
 *
 * Every write invalidates the report as well as the list, because both change
 * the same number: a bill whose amount was corrected changes what the month
 * costs, and the dashboard would otherwise keep showing the figure the owner
 * just fixed.
 */
export function useChecklist(period: string) {
  const queryClient = useQueryClient()
  const { notifier } = clientConfig()

  const query = useQuery({
    queryKey: ['checklist', period],
    queryFn: async (): Promise<MonthlyChecklistDTO> =>
      (await api().get<MonthlyChecklistDTO>('/recurrence/checklist', { params: { period } })).data,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['checklist'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
    queryClient.invalidateQueries({ queryKey: ['recurrences'] })
  }

  const setPaid = useMutation({
    mutationFn: async ({ recurrenceId, paid }: { recurrenceId: string; paid: boolean }) => {
      await api().post(`/recurrence/${recurrenceId}/paid`, { period, paid })
    },
    onSuccess: invalidate,
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível marcar o pagamento.')),
  })

  const adjustAmount = useMutation({
    mutationFn: async ({
      recurrenceId,
      amount,
    }: {
      recurrenceId: string
      // null clears the adjustment and puts the estimate back in charge.
      amount: number | null
    }) => {
      await api().post(`/recurrence/${recurrenceId}/amount`, { period, amount })
    },
    onSuccess: () => {
      notifier.success('Valor do mês atualizado.')
      invalidate()
    },
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível ajustar o valor.')),
  })

  return {
    checklist: query.data,
    items: query.data?.items ?? [],
    loading: query.isLoading,
    totalCents: query.data?.totalCents ?? 0,
    paidCents: query.data?.paidCents ?? 0,
    pendingCents: query.data?.pendingCents ?? 0,
    setPaid: (recurrenceId: string, paid: boolean) => setPaid.mutate({ recurrenceId, paid }),
    adjustAmount: (recurrenceId: string, amount: number | null) =>
      adjustAmount.mutate({ recurrenceId, amount }),
    adjusting: adjustAmount.isPending,
  }
}
