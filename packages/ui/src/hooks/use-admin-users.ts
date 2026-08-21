'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserDTO } from '@auth/adapters'
import { api } from '../http/api'
import { errorMessage } from '../http/errors'
import { clientConfig } from '../config'

/**
 * The front door. This is the ONLY screen that shows other people's e-mail, and
 * deliberately so: without it the owner cannot tell which friend is asking to
 * get in.
 */
export function useAdminUsers() {
  const queryClient = useQueryClient()
  const { notifier } = clientConfig()

  const query = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async (): Promise<UserDTO[]> => (await api().get<UserDTO[]>('/admin/users')).data,
  })

  const decide = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'approve' | 'reject' }) => {
      await api().post(`/admin/users/${userId}/${action}`)
    },
    onSuccess: (_data, { action }) => {
      notifier.success(action === 'approve' ? 'Conta liberada.' : 'Acesso revogado.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível concluir a ação.')),
  })

  const users = query.data ?? []

  return {
    // Whoever is waiting comes first — that is what this screen is opened for.
    pending: users.filter((user) => user.approvalStatus === 'pending'),
    others: users.filter((user) => user.approvalStatus !== 'pending'),
    loading: query.isLoading,
    approve: (userId: string) => decide.mutate({ userId, action: 'approve' }),
    reject: (userId: string) => decide.mutate({ userId, action: 'reject' }),
    deciding: decide.isPending,
  }
}
