import type { CardKind } from '@bank/adapters'

/** What a card can pay with, as the form offers it. The union is the domain's
 * (`CardKind`); this only labels it. */
export const CARD_KIND_OPTIONS: { value: CardKind; label: string }[] = [
  { value: 'credit', label: 'Crédito' },
  { value: 'debit', label: 'Débito' },
  { value: 'both', label: 'Crédito e débito' },
]

export const CARD_KIND_LABELS: Record<CardKind, string> = {
  credit: 'Crédito',
  debit: 'Débito',
  both: 'Crédito e débito',
}
