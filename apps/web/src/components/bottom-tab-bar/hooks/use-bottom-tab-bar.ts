'use client'

import { usePathname } from 'next/navigation'
import { MORE_ROUTE, NAV_ITEMS } from '@/data/nav-items'

export function useBottomTabBar() {
  const pathname = usePathname()
  const primary = NAV_ITEMS.filter((item) => item.primary)

  return {
    items: primary,
    isActive: (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    // "Mais" stays lit while the user is on any screen it leads to, so the bar
    // never looks like nothing is selected.
    moreActive:
      pathname === MORE_ROUTE || !primary.some((item) => pathname.startsWith(item.href)),
  }
}
