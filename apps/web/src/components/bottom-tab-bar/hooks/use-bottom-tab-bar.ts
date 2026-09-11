'use client'

import { usePathname } from 'next/navigation'
import { useNotifications } from 'ui'
import { MORE_ROUTE, TAB_FOR_SECTION, TAB_ITEMS } from '@/data/nav-items'

export function useBottomTabBar() {
  const pathname = usePathname()
  // The dot is the ONLY unread signal left in the chrome, now that there is no
  // header to hang a bell on — so the bar reads the count itself.
  const { unreadCount } = useNotifications()

  /**
   * Which tab the current screen belongs to. A screen reached from the menu
   * ("a pagar", "bancos") keeps MENU lit rather than lighting nothing: a tab
   * bar with no active tab reads as broken, and the owner did in fact get there
   * through the menu.
   */
  const activeHref = (() => {
    const tab = TAB_ITEMS.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    if (tab) return tab.href

    const section = Object.keys(TAB_FOR_SECTION).find(
      (href) => pathname === href || pathname.startsWith(`${href}/`),
    )
    return section ? TAB_FOR_SECTION[section] : MORE_ROUTE
  })()

  return {
    items: TAB_ITEMS,
    activeHref,
    hasUnread: unreadCount > 0,
  }
}
