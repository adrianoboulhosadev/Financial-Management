import type { TransactionType } from '@transaction/adapters'

/** The two directions money moves, as every form offers them. */
export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Receita' },
]

/** Narrowing of a listing. `all` is a screen concept, not a domain one. */
export type TransactionFilterValue = TransactionType | 'all'

export const TRANSACTION_FILTERS: { value: TransactionFilterValue; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'expense', label: 'Despesas' },
  { value: 'income', label: 'Receitas' },
]
