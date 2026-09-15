import { CardKind } from './card-kind'
import { CardBrand } from './card-brand'

/** READ projection (CQRS) of a bank. Plain interface — no entity, no value
 * objects. `cardCount` is computed by the query so the screen can say what a
 * bank still holds without a second round trip. */
export interface BankDTO {
  id: string
  ownerId: string
  name: string
  agency: string | null
  accountNumber: string | null
  cardCount: number
}

/** READ projection of a card. It carries `bankId` but NOT the bank's name: the
 * front already holds the bank list it renders the picker from. */
export interface CardDTO {
  id: string
  ownerId: string
  bankId: string
  brand: CardBrand
  kind: CardKind
  lastFourDigits: string
  // The invoice calendar and the limit — all null on a debit card, and on any
  // credit card whose owner has not filled them in.
  closingDay: number | null
  dueDay: number | null
  limitCents: number | null
}

/** One invoice of one card, named by the month it CLOSES in. */
export interface CardInvoiceDTO {
  // YYYY-MM.
  period: string
  closesOn: Date
  dueOn: Date
  amountCents: number
  // The one still taking charges right now. Exactly one invoice is open.
  open: boolean
}

/** How full a card's limit is. The same three words a budget ceiling uses —
 * the state is the same question — but the threshold is the `bank` context's
 * own call, so moving one never moves the other. */
export type CardLimitStatus = 'ok' | 'warning' | 'exceeded'

/** A card's invoices plus what they say about its limit. */
export interface CardInvoicesDTO {
  cardId: string
  limitCents: number | null
  // The open invoice plus everything already committed to the later ones —
  // which is what is actually holding the limit down, since an instalment due
  // in March is already spent even though it has not been billed.
  usedCents: number
  // Null when the limit is unknown: the invoice still reads fine without it,
  // and inventing a zero would report a card as maxed out.
  availableCents: number | null
  usagePercentage: number | null
  limitStatus: CardLimitStatus | null
  // Open first, then the future ones in chronological order.
  invoices: CardInvoiceDTO[]
}
