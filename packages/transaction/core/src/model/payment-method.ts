import { ValidationError, Errors } from 'shared'

/**
 * How the money actually moved. Kept as a closed list rather than free text
 * because two screens read it: the movement list, which says what a purchase
 * was paid with, and the instalment rule below, which only credit can trigger.
 *
 * It is OPTIONAL on a movement (`null` is a valid state): every row recorded
 * before banks and cards existed carries none, and an entity that refused to
 * reconstitute those would make its own history unreadable.
 */
export type PaymentMethod = 'pix' | 'ted' | 'boleto' | 'cash' | 'debit' | 'credit'

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'pix',
  'ted',
  'boleto',
  'cash',
  'debit',
  'credit',
]

/** Absent stays absent; anything present has to be one of the six. */
export function assertPaymentMethod(value?: string | null): PaymentMethod | null {
  if (value === undefined || value === null || value === '') return null
  if (!PAYMENT_METHODS.includes(value as PaymentMethod)) {
    ValidationError.throwError(Errors.INVALID_PAYMENT_METHOD, value)
  }
  return value as PaymentMethod
}

/**
 * The methods that settle by themselves on the due date — the owner never has
 * to tick them off in the month's checklist. Cash and a card charge need a
 * human to actually do something; pix and a direct debit do not.
 */
export const SELF_SETTLING_METHODS: readonly PaymentMethod[] = ['pix', 'debit', 'boleto']
