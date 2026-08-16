import type { ReactNode } from 'react'
import {
  AdminIcon,
  BudgetsIcon,
  CategoriesIcon,
  DashboardIcon,
  IncomeIcon,
  NotificationsIcon,
  RecurrencesIcon,
  TransactionsIcon,
} from './icons'

export interface NavItem {
  href: string
  label: string
  icon: (props: { className?: string }) => ReactNode
  adminOnly?: boolean
}

// Ordered by how often the screen is opened, not alphabetically: the month's
// numbers first, then what feeds them, then what is only set up once.
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Visão do mês', icon: DashboardIcon },
  { href: '/transactions', label: 'Lançamentos', icon: TransactionsIcon },
  { href: '/budgets', label: 'Orçamentos', icon: BudgetsIcon },
  { href: '/income', label: 'Renda', icon: IncomeIcon },
  { href: '/recurrences', label: 'Fixos do mês', icon: RecurrencesIcon },
  { href: '/categories', label: 'Categorias', icon: CategoriesIcon },
  { href: '/notifications', label: 'Notificações', icon: NotificationsIcon },
  { href: '/admin', label: 'Contas', icon: AdminIcon, adminOnly: true },
]
