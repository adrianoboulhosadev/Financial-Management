'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IncomeSourceDTO, MonthlyIncomeDTO } from '@income/adapters'
import { api } from '@/lib/api'
import { toCents } from '@/lib/money'
import { notify } from '@/lib/notify'

export function useIncome() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [payday, setPayday] = useState('5')
  const [pendingDeletion, setPendingDeletion] = useState<IncomeSourceDTO | null>(null)

  const sources = useQuery({
    queryKey: ['income', 'sources'],
    queryFn: async (): Promise<IncomeSourceDTO[]> =>
      (await api.get<IncomeSourceDTO[]>('/income')).data,
  })

  const monthly = useQuery({
    queryKey: ['income', 'monthly'],
    queryFn: async (): Promise<MonthlyIncomeDTO> =>
      (await api.get<MonthlyIncomeDTO>('/income/monthly')).data,
  })

  // Income feeds "how much is left", so the report is invalidated with it.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['income'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
  }

  const create = useMutation({
    mutationFn: async () => {
      await api.post('/income', { name, amount: toCents(amount), payday: Number(payday) })
    },
    onSuccess: () => {
      notify.success('Fonte de renda adicionada.')
      setName('')
      setAmount('')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível adicionar a fonte de renda.'),
  })

  const setActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await api.post(`/income/${id}/active`, { active })
    },
    onSuccess: invalidate,
    onError: (error) => notify.failure(error, 'Não foi possível atualizar a fonte de renda.'),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/income/${id}`)
    },
    onSuccess: () => {
      notify.success('Fonte de renda excluída.')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível excluir a fonte de renda.'),
  })

  return {
    sources: sources.data ?? [],
    monthlyTotal: monthly.data?.totalCents ?? 0,
    loading: sources.isLoading,
    name,
    setName,
    amount,
    setAmount,
    payday,
    setPayday,
    create: () => create.mutate(),
    creating: create.isPending,
    toggleActive: (source: IncomeSourceDTO) =>
      setActive.mutate({ id: source.id, active: !source.active }),
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      remove.mutate(pendingDeletion.id)
      setPendingDeletion(null)
    },
  }
}
