import type { ReactNode } from 'react'
import {
  AdminIcon,
  BudgetsIcon,
  CategoriesIcon,
  NotificationsIcon,
  ProfileIcon,
  RecurrencesIcon,
} from './icons'
import type { IconProps } from './icons'

export interface NavItem {
  href: string
  label: string
  icon: (props: IconProps) => ReactNode
  adminOnly?: boolean
}

/**
 * What the "Mais" tab lists — the SAME split the web makes below `sm`: the four
 * primary screens are tabs, everything else lives here. Keeping the two lists
 * in step is what makes the browser at phone width and the app feel like one
 * product.
 *
 * The primary four are not here: they are declared by the Tabs navigator
 * itself, which is where Expo Router expects them.
 */
export const SECONDARY_NAV: NavItem[] = [
  { href: '/recurrences', label: 'Fixos do mês', icon: RecurrencesIcon },
  { href: '/categories', label: 'Categorias', icon: CategoriesIcon },
  { href: '/notifications', label: 'Notificações', icon: NotificationsIcon },
  { href: '/profile', label: 'Perfil', icon: ProfileIcon },
  { href: '/admin', label: 'Contas', icon: AdminIcon, adminOnly: true },
]
