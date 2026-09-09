'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateRecurrenceInput,
  UpdateRecurrenceInput,
  RecurrenceDTO,
} from '@transaction/adapters'
import { api } from '../http/api'
import { errorMessage } from '../http/errors'
import { clientConfig } from '../config'

/**
 * The fixed monthly movements the worker posts on their own. Every write
 * invalidates the month's checklist too: a new bill is a new line to tick off,
 * a paused one stops being owed, and one given a deadline leaves the list on
 * the month it ends.
 */
export function useRecurrences() {
  const queryClient = useQueryClient()
  const { notifier } = clientConfig()

  const query = useQuery({
    queryKey: ['recurrences'],
    queryFn: async (): Promise<RecurrenceDTO[]> =>
      (await api().get<RecurrenceDTO[]>('/recurrence')).data,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['recurrences'] })
    queryClient.invalidateQueries({ queryKey: ['checklist'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
  }

  const create = useMutation({
    mutationFn: async (input: CreateRecurrenceInput) => {
      await api().post('/recurrence', input)
    },
    onSuccess: () => {
      notifier.success('Lançamento fixo criado.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível criar o lançamento fixo.')),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: UpdateRecurrenceInput & { id: string }) => {
      await api().patch(`/recurrence/${id}`, input)
    },
    onSuccess: () => {
      notifier.success('Lançamento fixo atualizado.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível atualizar o lançamento fixo.')),
  })

  const setActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await api().post(`/recurrence/${id}/active`, { active })
    },
    onSuccess: invalidate,
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível atualizar o lançamento fixo.')),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api().delete(`/recurrence/${id}`)
    },
    onSuccess: () => {
      notifier.success('Lançamento fixo excluído.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível excluir o lançamento fixo.')),
  })

  return {
    recurrences: query.data ?? [],
    loading: query.isLoading,
    create: create.mutate,
    creating: create.isPending,
    update: update.mutate,
    toggleActive: (recurrence: RecurrenceDTO) =>
      setActive.mutate({ id: recurrence.id, active: !recurrence.active }),
    remove: remove.mutate,
  }
}
