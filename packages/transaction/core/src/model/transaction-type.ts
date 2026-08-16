import { ValidationError, Errors } from 'shared'

/**
 * Which way the money went. It is the TYPE that carries the direction — the
 * amount itself is always a positive magnitude (see Money), so no reader ever
 * has to guess what a negative number meant.
 */
export type TransactionType = 'expense' | 'income'

export const TRANSACTION_TYPES: readonly TransactionType[] = ['expense', 'income']

export function assertTransactionType(value?: string): TransactionType {
  if (!TRANSACTION_TYPES.includes(value as TransactionType)) {
    ValidationError.throwError(Errors.INVALID_TRANSACTION_TYPE, value)
  }
  return value as TransactionType
}
