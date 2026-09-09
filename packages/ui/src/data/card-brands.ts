import type { CardBrand } from '@bank/adapters'

/**
 * The network printed on a card, as the form offers it. The union is the
 * domain's (`CardBrand`); this only labels it, so a screen can never offer a
 * brand the backend would refuse.
 *
 * The meal/benefit networks sit alongside the credit ones because in Brazil
 * they are what pays the groceries.
 */
export const CARD_BRAND_OPTIONS: { value: CardBrand; label: string }[] = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'American Express' },
  { value: 'hipercard', label: 'Hipercard' },
  { value: 'diners', label: 'Diners Club' },
  { value: 'discover', label: 'Discover' },
  { value: 'alelo', label: 'Alelo' },
  { value: 'sodexo', label: 'Sodexo' },
  { value: 'vr', label: 'VR' },
  { value: 'ticket', label: 'Ticket' },
  { value: 'other', label: 'Outra' },
]

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'American Express',
  hipercard: 'Hipercard',
  diners: 'Diners Club',
  discover: 'Discover',
  alelo: 'Alelo',
  sodexo: 'Sodexo',
  vr: 'VR',
  ticket: 'Ticket',
  other: 'Outra',
}
