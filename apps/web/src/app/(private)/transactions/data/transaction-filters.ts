import type { TransactionType } from '@transaction/adapters'

/** Recorte da listagem. Só a tela de lançamentos filtra, então isto é da rota. */
export type TransactionFilterValue = TransactionType | 'all'

export const TRANSACTION_FILTERS: { value: TransactionFilterValue; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'expense', label: 'Despesas' },
  { value: 'income', label: 'Receitas' },
]
