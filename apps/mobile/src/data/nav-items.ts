import type { ReactNode } from 'react'
import {
  BanksIcon,
  BudgetsIcon,
  CategoriesIcon,
  ChecklistIcon,
  InvestmentsIcon,
  ProfileIcon,
  RecurrencesIcon,
} from './icons'
import type { IconProps } from './icons'

export interface NavItem {
  href: string
  label: string
  icon: (props: IconProps) => ReactNode
}

export interface MenuGroup {
  title: string
  items: NavItem[]
}

/**
 * What the "Menu" tab lists — the SAME groups, in the same order, as the web's
 * `MENU_GROUPS`. Keeping the two in step is what makes the browser at phone
 * width and the installed app read as one product.
 *
 * The five tabs are not here: they are declared by the Tabs navigator itself,
 * which is where Expo Router expects them.
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
