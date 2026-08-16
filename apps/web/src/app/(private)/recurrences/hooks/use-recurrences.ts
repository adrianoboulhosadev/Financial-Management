'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { RecurrenceDTO, TransactionType } from '@transaction/adapters'
import { api } from '@/lib/api'
import { toCents } from '@/lib/money'
import { notify } from '@/lib/notify'
import { useCategories } from '@/hooks/use-categories'

export function useRecurrences() {
  const queryClient = useQueryClient()
  const { pathOf } = useCategories()
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('5')
  const [pendingDeletion, setPendingDeletion] = useState<RecurrenceDTO | null>(null)

  const query = useQuery({
    queryKey: ['recurrences'],
    queryFn: async (): Promise<RecurrenceDTO[]> =>
      (await api.get<RecurrenceDTO[]>('/recurrence')).data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['recurrences'] })

  const create = useMutation({
    mutationFn: async () => {
      await api.post('/recurrence', {
        type,
        categoryId: categoryId || null,
        description,
        amount: toCents(amount),
        dayOfMonth: Number(dayOfMonth),
      })
    },
    onSuccess: () => {
      notify.success('Lançamento fixo criado.')
      setDescription('')
      setAmount('')
      setCategoryId('')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível criar o lançamento fixo.'),
  })

  const setActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await api.post(`/recurrence/${id}/active`, { active })
    },
    onSuccess: invalidate,
    onError: (error) => notify.failure(error, 'Não foi possível atualizar o lançamento fixo.'),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/recurrence/${id}`)
    },
    onSuccess: () => {
      notify.success('Lançamento fixo excluído.')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível excluir o lançamento fixo.'),
  })

  return {
    recurrences: query.data ?? [],
    loading: query.isLoading,
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
    create: () => create.mutate(),
    creating: create.isPending,
    toggleActive: (recurrence: RecurrenceDTO) =>
      setActive.mutate({ id: recurrence.id, active: !recurrence.active }),
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      remove.mutate(pendingDeletion.id)
      setPendingDeletion(null)
    },
    labelFor: (id: string | null) => (id ? pathOf(id) : 'Sem categoria'),
  }
}
