'use client'

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  BankDTO,
  CardDTO,
  CreateBankInput,
  UpdateBankInput,
  CreateCardInput,
} from '@bank/adapters'
import { api } from '../http/api'
import { errorMessage } from '../http/errors'
import { clientConfig } from '../config'

export const BANKS_KEY = ['banks']

/**
 * The owner's banks and the cards hanging from them — ONE hook, because no
 * screen ever wants one without the other: a card is only meaningful under a
 * bank, and a bank's row says how many cards it holds.
 *
 * The writes invalidate the movements too: a card the owner just deleted must
 * stop being offered by the form that files an expense.
 */
export function useBanks() {
  const queryClient = useQueryClient()
  const { notifier } = clientConfig()

  const banksQuery = useQuery({
    queryKey: BANKS_KEY,
    queryFn: async (): Promise<BankDTO[]> => (await api().get<BankDTO[]>('/bank')).data,
  })

  const cardsQuery = useQuery({
    queryKey: ['cards'],
    queryFn: async (): Promise<CardDTO[]> => (await api().get<CardDTO[]>('/bank/card')).data,
  })

  const banks = useMemo(() => banksQuery.data ?? [], [banksQuery.data])
  const cards = useMemo(() => cardsQuery.data ?? [], [cardsQuery.data])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: BANKS_KEY })
    queryClient.invalidateQueries({ queryKey: ['cards'] })
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
  }

  const createBank = useMutation({
    mutationFn: async (input: CreateBankInput) => {
      await api().post('/bank', input)
    },
    onSuccess: () => {
      notifier.success('Banco cadastrado.')
      invalidate()
    },
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível cadastrar o banco.')),
  })

  const updateBank = useMutation({
    mutationFn: async ({ id, ...input }: UpdateBankInput & { id: string }) => {
      await api().patch(`/bank/${id}`, input)
    },
    onSuccess: () => {
      notifier.success('Banco atualizado.')
      invalidate()
    },
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível atualizar o banco.')),
  })

  const removeBank = useMutation({
    mutationFn: async (bankId: string) => {
      await api().delete(`/bank/${bankId}`)
    },
    onSuccess: () => {
      notifier.success('Banco excluído.')
      invalidate()
    },
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível excluir o banco.')),
  })

  const createCard = useMutation({
    mutationFn: async (input: CreateCardInput) => {
      await api().post('/bank/card', input)
    },
    onSuccess: () => {
      notifier.success('Cartão cadastrado.')
      invalidate()
    },
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível cadastrar o cartão.')),
  })

  const removeCard = useMutation({
    mutationFn: async (cardId: string) => {
      await api().delete(`/bank/card/${cardId}`)
    },
    onSuccess: () => {
      notifier.success('Cartão excluído.')
      invalidate()
    },
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível excluir o cartão.')),
  })

  const bankById = useMemo(() => new Map(banks.map((bank) => [bank.id, bank])), [banks])
  const cardById = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards])

  return {
    banks,
    cards,
    loading: banksQuery.isLoading || cardsQuery.isLoading,
    /** The cards of one bank — how both screens group them. */
    cardsOf: (bankId: string) => cards.filter((card) => card.bankId === bankId),
    /** How a bank/card reads next to a movement. Empty when there is none, so a
     * caller can simply concatenate it. */
    bankNameOf: (bankId: string | null) => (bankId ? (bankById.get(bankId)?.name ?? '') : ''),
    cardLabelOf: (cardId: string | null) => {
      const card = cardId ? cardById.get(cardId) : undefined
      return card ? `${card.name} ····${card.lastFourDigits}` : ''
    },
    createBank: createBank.mutate,
    creatingBank: createBank.isPending,
    updateBank: updateBank.mutate,
    removeBank: removeBank.mutate,
    createCard: createCard.mutate,
    creatingCard: createCard.isPending,
    removeCard: removeCard.mutate,
  }
}
