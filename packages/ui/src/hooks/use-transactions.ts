'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  RecordTransactionInput,
  TransactionDTO,
  TransactionType,
  UpdateTransactionInput,
} from '@transaction/adapters'
import { api } from '../http/api'
import { errorMessage } from '../http/errors'
import { clientConfig } from '../config'

interface Options {
  // YYYY-MM
  period: string
  type?: TransactionType
}

/**
 * The month's movements plus the writes. A movement changes the month's totals
 * and can trip a ceiling, so every write invalidates the report and the budgets
 * alongside the list itself — otherwise the dashboard would keep showing a
 * number the user just changed.
 */
export function useTransactions({ period, type }: Options) {
  const queryClient = useQueryClient()
  const { notifier } = clientConfig()

  const query = useQuery({
    queryKey: ['transactions', period, type ?? 'all'],
    queryFn: async (): Promise<TransactionDTO[]> =>
      (await api().get<TransactionDTO[]>('/transaction', { params: { period, type } })).data,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
  }

  const record = useMutation({
    mutationFn: async (input: RecordTransactionInput) => {
      await api().post('/transaction', input)
    },
    onSuccess: () => {
      notifier.success('Lançamento registrado.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível registrar o lançamento.')),
  })

  /**
   * Fixing a movement already recorded — a wrong figure, the category it should
   * have landed on, the receipt that only turned up later.
   *
   * The TYPE is not here, and neither is the split: the domain does not accept
   * either (an expense does not become an income, and a 6x turning into a 3x is
   * a different set of rows, not a different value on one of them). What the
   * entity refuses, the form simply does not offer.
   */
  const update = useMutation({
    mutationFn: async ({ id, ...input }: UpdateTransactionInput & { id: string }) => {
      await api().patch(`/transaction/${id}`, input)
    },
    onSuccess: () => {
      notifier.success('Lançamento atualizado.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível atualizar o lançamento.')),
  })

  const remove = useMutation({
    mutationFn: async (transactionId: string) => {
      await api().delete(`/transaction/${transactionId}`)
    },
    onSuccess: () => {
      notifier.success('Lançamento excluído.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível excluir o lançamento.')),
  })

  return {
    transactions: query.data ?? [],
    loading: query.isLoading,
    record: record.mutate,
    recording: record.isPending,
    update: update.mutate,
    updating: update.isPending,
    remove: remove.mutate,
  }
}
