'use client'

import { useAuth, useChecklist, useInvestments, useNotifications, useRecurrences, toPeriod } from 'ui'
import { MENU_GROUPS } from '@/data/nav-items'

/**
 * The menu is not just a list of links: each row carries the one number that
 * says whether it is worth opening right now — how many bills are still due,
 * how much is invested. That is the whole reason the screen earns a place among
 * the five tabs instead of being a drawer.
 */
export function useMore() {
  const { user, logout } = useAuth()
  const period = toPeriod()
  const checklist = useChecklist(period)
  // The DTO carries what the month OWES, not how many lines are open, so the
  // count is derived from the items the screen already has.
  const pendingCount = checklist.items.filter((item) => !item.paid).length
  const { recurrences } = useRecurrences()
  const { portfolio } = useInvestments()
  const { unreadCount } = useNotifications()

  const displayName = user?.nickname?.trim() || user?.email?.split('@')[0] || 'Você'
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return {
    groups: MENU_GROUPS,
    user,
    displayName,
    initials,
    logout,
    /** The badge for each row, by href. Absent means the row shows nothing —
     * a count of zero is noise, not information. */
    badges: {
      '/checklist': pendingCount > 0 ? `${pendingCount} em aberto` : undefined,
      '/recurrences': recurrences.length > 0 ? `${recurrences.length}` : undefined,
      '/investments': portfolio ? portfolio.valueCents : undefined,
      '/notifications': unreadCount > 0 ? `${unreadCount}` : undefined,
    } as Record<string, string | number | undefined>,
  }
}
