'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { NAV_ITEMS } from '../data/nav-items'

export function useSidebar() {
  const pathname = usePathname()
  const { user, isAdmin, logout } = useAuth()
  // The rail widens on click and reveals the labels.
  const [expanded, setExpanded] = useState(true)

  const displayName = user?.nickname || user?.email.split('@')[0] || ''

  return {
    user,
    logout,
    expanded,
    toggle: () => setExpanded((current) => !current),
    items: NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin),
    isActive: (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    displayName,
    initials: displayName.slice(0, 2).toUpperCase(),
  }
}
