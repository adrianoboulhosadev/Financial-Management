import { ValidationError, Errors } from 'shared'

/**
 * The network printed on the card. A closed list rather than free text because
 * it is what IDENTIFIES the card on screen ("Visa ····1234") — free text would
 * give one owner "Visa", "visa" and "VISA" as three different cards.
 *
 * The meal/benefit networks are here alongside the credit ones because in
 * Brazil they are what pays the groceries, and a card the product cannot name
 * is a card the owner cannot file a movement against. `other` is the escape
 * hatch that keeps the list from having to be exhaustive.
 */
export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'elo'
  | 'amex'
  | 'hipercard'
  | 'diners'
  | 'discover'
  | 'alelo'
  | 'sodexo'
  | 'vr'
  | 'ticket'
  | 'other'

export const CARD_BRANDS: readonly CardBrand[] = [
  'visa',
  'mastercard',
  'elo',
  'amex',
  'hipercard',
  'diners',
  'discover',
  'alelo',
  'sodexo',
  'vr',
  'ticket',
  'other',
]

export function assertCardBrand(value?: string): CardBrand {
  if (!CARD_BRANDS.includes(value as CardBrand)) {
    ValidationError.throwError(Errors.INVALID_CARD_BRAND, value)
  }
  return value as CardBrand
}
