'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  InvestmentDTO,
  PortfolioDTO,
  CreateInvestmentInput,
  UpdateInvestmentInput,
} from '@investment/adapters'
import { api } from '../http/api'
import { errorMessage } from '../http/errors'
import { clientConfig } from '../config'

/**
 * The owner's investments and what the portfolio is worth. Two reads rather
 * than one because they answer different questions: the LIST includes what was
 * redeemed (the screen manages those too) and the PORTFOLIO is only what is
 * still invested — the rule that separates them lives in the domain service,
 * not here.
 */
export function useInvestments() {
  const queryClient = useQueryClient()
  const { notifier } = clientConfig()

  const listQuery = useQuery({
    queryKey: ['investments'],
    queryFn: async (): Promise<InvestmentDTO[]> =>
      (await api().get<InvestmentDTO[]>('/investment')).data,
  })

  const portfolioQuery = useQuery({
    queryKey: ['investments', 'portfolio'],
    queryFn: async (): Promise<PortfolioDTO> =>
      (await api().get<PortfolioDTO>('/investment/portfolio')).data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['investments'] })

  const create = useMutation({
    mutationFn: async (input: CreateInvestmentInput) => {
      await api().post('/investment', input)
    },
    onSuccess: () => {
      notifier.success('Investimento cadastrado.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível cadastrar o investimento.')),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: UpdateInvestmentInput & { id: string }) => {
      await api().patch(`/investment/${id}`, input)
    },
    onSuccess: () => {
      notifier.success('Investimento atualizado.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível atualizar o investimento.')),
  })

  const setActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await api().post(`/investment/${id}/active`, { active })
    },
    onSuccess: invalidate,
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível atualizar o investimento.')),
  })

  const remove = useMutation({
    mutationFn: async (investmentId: string) => {
      await api().delete(`/investment/${investmentId}`)
    },
    onSuccess: () => {
      notifier.success('Investimento excluído.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível excluir o investimento.')),
  })

  return {
    investments: listQuery.data ?? [],
    portfolio: portfolioQuery.data,
    loading: listQuery.isLoading || portfolioQuery.isLoading,
    create: create.mutate,
    creating: create.isPending,
    /** Writing down what it is worth today — the edit that actually gets made
     * month after month. */
    updateValue: (id: string, currentAmount: number | null) =>
      update.mutate({ id, currentAmount }),
    update: update.mutate,
    toggleActive: (investment: InvestmentDTO) =>
      setActive.mutate({ id: investment.id, active: !investment.active }),
    remove: remove.mutate,
  }
}
