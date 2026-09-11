/** The three ways to read the same month: as it happened, as it split, and
 * against what it was allowed to be. Tabs rather than three stacked sections
 * because they answer the SAME question — they are alternatives, not a sequence
 * to scroll through. */
export type DashboardTab = 'timeline' | 'categories' | 'budgets'

export const DASHBOARD_TABS: { value: DashboardTab; label: string }[] = [
  { value: 'timeline', label: 'Linha do mês' },
  { value: 'categories', label: 'Categorias' },
  { value: 'budgets', label: 'Tetos' },
]
