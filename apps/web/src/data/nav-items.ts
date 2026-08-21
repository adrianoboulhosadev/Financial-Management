import type { ReactNode } from 'react'
import {
  AdminIcon,
  BudgetsIcon,
  CategoriesIcon,
  DashboardIcon,
  IncomeIcon,
  NotificationsIcon,
  ProfileIcon,
  RecurrencesIcon,
  TransactionsIcon,
} from './icons'

export interface NavItem {
  href: string
  label: string
  /** Shorter label for the bottom tab bar, where the space is a phone's. */
  shortLabel?: string
  icon: (props: { className?: string }) => ReactNode
  adminOnly?: boolean
  /** Earns a slot in the bottom tab bar. Everything else lives behind "Mais". */
  primary?: boolean
}

/**
 * Lives in `src/data/` and not inside the sidebar because TWO independent
 * components read it — the sidebar (desktop) and the bottom tab bar (phone) —
 * and the layout composes both without either owning the other.
 *
 * Ordered by how often the screen is opened, not alphabetically: the month's
 * numbers first, then what feeds them, then what is only set up once.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Visão do mês', shortLabel: 'Mês', icon: DashboardIcon, primary: true },
  {
    href: '/transactions',
    label: 'Lançamentos',
    shortLabel: 'Lançar',
    icon: TransactionsIcon,
    primary: true,
  },
  { href: '/budgets', label: 'Orçamentos', shortLabel: 'Teto', icon: BudgetsIcon, primary: true },
  { href: '/income', label: 'Renda', icon: IncomeIcon, primary: true },
  { href: '/recurrences', label: 'Fixos do mês', icon: RecurrencesIcon },
  { href: '/categories', label: 'Categorias', icon: CategoriesIcon },
  { href: '/notifications', label: 'Notificações', icon: NotificationsIcon },
  { href: '/profile', label: 'Perfil', icon: ProfileIcon },
  { href: '/admin', label: 'Contas', icon: AdminIcon, adminOnly: true },
]

/**
 * A phone's tab bar holds five targets before they stop being tappable, so the
 * four primary screens get a slot and everything else is reached through
 * "Mais" — the same split the app uses, which is the point.
 */
export const MORE_ROUTE = '/more'
