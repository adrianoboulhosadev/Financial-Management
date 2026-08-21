import type { TransactionType } from '@transaction/adapters'

/**
 * As duas direções em que o dinheiro anda, como o formulário as oferece.
 *
 * Vive no `src/data/` global, e não na rota: DUAS rotas diferentes usam a mesma
 * lista (o lançamento avulso e o lançamento fixo). Deixá-la na pasta de uma
 * delas obrigaria a outra a importar `../transactions/data/...`, e dado igual
 * copiado (ou emprestado) entre rotas é sempre bug esperando acontecer.
 */
export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Receita' },
]
