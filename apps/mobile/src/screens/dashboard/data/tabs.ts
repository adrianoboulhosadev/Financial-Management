/** The three ways to read the same month: as it happened, as it split, and
 * against what it was allowed to be. The SAME three tabs as the web's
 * dashboard — they answer the same question, so they are alternatives rather
 * than a sequence to scroll through. */
export type DashboardTab = 'timeline' | 'categories' | 'budgets'

export const DASHBOARD_TABS: { value: DashboardTab; label: string }[] = [
  { value: 'timeline', label: 'Linha do mês' },
  { value: 'categories', label: 'Categorias' },
  { value: 'budgets', label: 'Tetos' },
]
