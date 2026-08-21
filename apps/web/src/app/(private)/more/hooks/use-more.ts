'use client'

import { useAuth } from 'client'
import { NAV_ITEMS } from '@/data/nav-items'

/** Everything the bottom tab bar could not fit — which is exactly what the
 * desktop sidebar shows below the first four entries. */
export function useMore() {
  const { isAdmin, logout } = useAuth()

  return {
    items: NAV_ITEMS.filter((item) => !item.primary && (!item.adminOnly || isAdmin)),
    logout,
  }
}
