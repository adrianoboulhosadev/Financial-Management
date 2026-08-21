'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NotificationFeedDTO } from '@notification/adapters'
import { api } from '../http/api'

export const NOTIFICATIONS_KEY = ['notifications']

/**
 * The inbox, shared by the bell (a short slice) and the notifications screen (a
 * long one). Keyed by `limit` so the two keep their own cache, but any write
 * invalidates the whole `['notifications']` prefix — marking one as read in the
 * bell updates the screen too, and vice versa.
 *
 * NO POLLING, deliberately: the backend PUSHES a ping the moment this user's
 * inbox changes and `useNotificationStream` invalidates this query, so it
 * re-reads on the actual event instead of on a timer.
 */
export function useNotifications(limit?: number) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [...NOTIFICATIONS_KEY, limit ?? null],
    queryFn: async (): Promise<NotificationFeedDTO> =>
      (await api().get<NotificationFeedDTO>('/notification', { params: { limit } })).data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      await api().post(`/notification/${notificationId}/read`)
    },
    onSuccess: invalidate,
  })

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await api().post('/notification/read-all')
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (notificationId: string) => {
      await api().delete(`/notification/${notificationId}`)
    },
    onSuccess: invalidate,
  })

  const removeAll = useMutation({
    mutationFn: async () => {
      await api().delete('/notification/all')
    },
    onSuccess: invalidate,
  })

  return {
    items: query.data?.items ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    loading: query.isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    markingAll: markAllAsRead.isPending,
    remove: remove.mutate,
    removeAll: removeAll.mutate,
    removingAll: removeAll.isPending,
  }
}
