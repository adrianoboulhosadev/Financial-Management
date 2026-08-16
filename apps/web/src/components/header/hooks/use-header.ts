'use client'

import { usePathname } from 'next/navigation'
import { SCREEN_TITLES } from '../data/screen-titles'

export function useHeader() {
  const pathname = usePathname()
  const match = Object.keys(SCREEN_TITLES).find(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  )

  return { title: match ? SCREEN_TITLES[match] : 'Financial' }
}
