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
}
