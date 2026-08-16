/** What the top bar calls each screen. Keyed by route so the header never has
 * to guess a title from the URL. */
export const SCREEN_TITLES: Record<string, string> = {
  '/dashboard': 'Visão do mês',
  '/transactions': 'Lançamentos',
  '/budgets': 'Orçamentos',
  '/income': 'Renda',
  '/recurrences': 'Fixos do mês',
  '/categories': 'Categorias',
  '/notifications': 'Notificações',
  '/profile': 'Perfil',
  '/admin': 'Contas',
}
