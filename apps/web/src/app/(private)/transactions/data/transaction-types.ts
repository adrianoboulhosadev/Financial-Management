import type { TransactionType } from '@transaction/adapters'

/** The two directions money moves, as the form and the filter offer them. */
export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Receita' },
]

export type TransactionFilterValue = TransactionType | 'all'

export const TRANSACTION_FILTERS: { value: TransactionFilterValue; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'expense', label: 'Despesas' },
  { value: 'income', label: 'Receitas' },
]
