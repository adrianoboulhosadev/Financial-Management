import { ValidationError, Errors } from 'shared'

/**
 * What a card is able to pay with. `both` is its own value rather than a pair
 * of flags because that is how the plastic is actually sold here — one card,
 * debit and credit on the same number — and a screen offering three choices is
 * simpler to answer than two checkboxes that can both be off.
 */
export type CardKind = 'debit' | 'credit' | 'both'

export const CARD_KINDS: readonly CardKind[] = ['debit', 'credit', 'both']

export function assertCardKind(value?: string): CardKind {
  if (!CARD_KINDS.includes(value as CardKind)) {
    ValidationError.throwError(Errors.INVALID_CARD_KIND, value)
  }
  return value as CardKind
}
