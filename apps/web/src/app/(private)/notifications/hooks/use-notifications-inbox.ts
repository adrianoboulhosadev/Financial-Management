'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { NotificationDTO } from '@notification/adapters'
import { useNotifications } from 'client'
import { INBOX_SIZE, type InboxFilter } from 'ui'

export function useNotificationsInbox() {
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
      if (notification.link) router.push(notification.link)
    },
  }
}
