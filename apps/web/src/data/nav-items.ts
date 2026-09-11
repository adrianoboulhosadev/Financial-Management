import type { ReactNode } from 'react'
import {
  BanksIcon,
  BudgetsIcon,
  CategoriesIcon,
  ChecklistIcon,
  DashboardIcon,
  DashboardFilledIcon,
  IncomeIcon,
  IncomeFilledIcon,
  InvestmentsIcon,
  MoreIcon,
  MoreFilledIcon,
  NotificationsIcon,
  NotificationsFilledIcon,
  ProfileIcon,
  RecurrencesIcon,
  TransactionsIcon,
  TransactionsFilledIcon,
  type IconProps,
} from './icons'

export interface NavItem {
  href: string
  label: string
  icon: (props: IconProps) => ReactNode
}

export interface TabItem extends NavItem {
  /** The same glyph, filled. A tab says it is the current one by filling in —
   * the one statement the outline weight cannot make on its own. */
  activeIcon: (props: IconProps) => ReactNode
}

/**
 * The five tabs, in the order a thumb reaches them. These are the screens
 * opened every day: what the month looks like, recording something, what the
 * app has to say, what comes in — and the way to everything else.
 *
 * Five is the ceiling, not a coincidence: past it the targets stop being
 * tappable, which is why everything that is set up once rather than read daily
 * lives behind "Menu".
 */
export const TAB_ITEMS: TabItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon, activeIcon: DashboardFilledIcon },
  {
    href: '/transactions',
    label: 'Lançar',
    icon: TransactionsIcon,
    activeIcon: TransactionsFilledIcon,
  },
  {
    href: '/notifications',
    label: 'Notificações',
    icon: NotificationsIcon,
    activeIcon: NotificationsFilledIcon,
  },
  { href: '/income', label: 'Renda', icon: IncomeIcon, activeIcon: IncomeFilledIcon },
  { href: '/more', label: 'Menu', icon: MoreIcon, activeIcon: MoreFilledIcon },
]

export const MORE_ROUTE = '/more'

/** Which tab owns a screen that is NOT itself a tab: opening "a pagar" from the
 * menu has to leave "Menu" lit, or the bar would claim you had left it. */
export const TAB_FOR_SECTION: Record<string, string> = {
  '/checklist': MORE_ROUTE,
  '/recurrences': MORE_ROUTE,
  '/investments': MORE_ROUTE,
  '/banks': MORE_ROUTE,
  '/categories': MORE_ROUTE,
  '/budgets': MORE_ROUTE,
  '/profile': MORE_ROUTE,
}

export interface MenuGroup {
  title: string
  items: NavItem[]
}

/**
 * What the menu lists, grouped by WHEN the screen is used: the three you look
 * at during the month, then the two you set up once and rarely reopen.
 *
 * The grouping is the point — an eleven-row flat list is a list nobody reads,
 * and "planejamento" versus "cadastros" is the distinction the owner already
 * makes between deciding and configuring.
 */
export const MENU_GROUPS: MenuGroup[] = [
  {
    title: 'Planejamento',
    items: [
      { href: '/checklist', label: 'A pagar', icon: ChecklistIcon },
      { href: '/budgets', label: 'Orçamentos', icon: BudgetsIcon },
      { href: '/recurrences', label: 'Fixos do mês', icon: RecurrencesIcon },
      { href: '/investments', label: 'Investimentos', icon: InvestmentsIcon },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { href: '/banks', label: 'Bancos e cartões', icon: BanksIcon },
      { href: '/categories', label: 'Categorias', icon: CategoriesIcon },
    ],
  },
  {
    title: 'Conta',
    items: [{ href: '/profile', label: 'Perfil', icon: ProfileIcon }],
  },
]
