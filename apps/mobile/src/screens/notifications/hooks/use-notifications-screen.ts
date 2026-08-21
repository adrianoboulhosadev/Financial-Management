import { useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import type { NotificationDTO } from '@notification/adapters'
import { INBOX_SIZE, type InboxFilter } from 'ui'
import { useNotifications } from 'client'

export function useNotificationsScreen() {
  const router = useRouter()
  const [filter, setFilter] = useState<InboxFilter>('all')
  const [confirmingClear, setConfirmingClear] = useState(false)
  const inbox = useNotifications(INBOX_SIZE)

  const items = useMemo(
    () => (filter === 'unread' ? inbox.items.filter((item) => !item.read) : inbox.items),
    [inbox.items, filter],
  )

  return {
    ...inbox,
    items,
    filter,
    setFilter,
    confirmingClear,
    askToClear: () => setConfirmingClear(true),
    cancelClear: () => setConfirmingClear(false),
    confirmClear: () => {
      inbox.removeAll()
      setConfirmingClear(false)
    },
    open: (notification: NotificationDTO) => {
      if (!notification.read) inbox.markAsRead(notification.id)
      // The links are the WEB's routes and happen to match the app's, since
      // both use the same names — /budgets, /transactions, /dashboard.
      if (notification.link) router.push(notification.link as never)
    },
  }
}
