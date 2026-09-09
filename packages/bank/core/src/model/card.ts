import { Entity, EntityProps, ValidationError, Errors } from 'shared'
import { CardKind, assertCardKind } from './card-kind'
import { CardBrand, assertCardBrand } from './card-brand'

export interface CardProps extends EntityProps {
  ownerId?: string
  // The bank that issued it. Intra-context, and never optional: a card without
  // a bank cannot answer "what am I paying this with".
  bankId?: string
  // The network printed on it. It is what identifies the card on screen, which
  // is why there is no nickname: "Visa ····1234" is already the answer.
  brand?: string
  kind?: string
  // The ONLY part of the number that is stored. It is enough to recognise the
  // card on a statement and it is not something anyone can spend.
  lastFourDigits?: string
}

/**
 * A card issued by one of the owner's banks. The entity owns the two rules that
 * make it trustworthy: it always points at a bank, and the only digits it ever
 * holds are the last four — the full number never enters the product, so it
 * cannot leak from it either.
 *
 * It has no NAME: a card is recognised by its network and its last digits, the
 * same way it reads on a statement, and asking someone to invent a nickname for
 * their own card is a field with no answer.
 */
export class Card extends Entity<Card, CardProps> {
  static readonly LAST_DIGITS_REGEX = /^\d{4}$/

  readonly ownerId: string
  readonly bankId: string
  brand: CardBrand
  kind: CardKind
  lastFourDigits: string

  constructor(props: CardProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')
    const bankId = props.bankId?.trim() ?? ''
    if (!bankId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'bankId')

    this.ownerId = ownerId
    this.bankId = bankId
    this.brand = assertCardBrand(props.brand)
    this.kind = assertCardKind(props.kind)
    this.lastFourDigits = Card.validLastDigits(props.lastFourDigits)
  }

  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  /** Whether this card can settle a purchase made on credit — which is what
   * decides if instalments are even on the table. */
  get allowsCredit(): boolean {
    return this.kind === 'credit' || this.kind === 'both'
  }

  get allowsDebit(): boolean {
    return this.kind === 'debit' || this.kind === 'both'
  }

  /**
   * The bank never changes (a card moved to another bank is another card).
   * Validated before anything is assigned, so a rejected edit leaves the card
   * exactly as it was.
   */
  edit(fields: { brand?: string; kind?: string; lastFourDigits?: string }): void {
    const brand = fields.brand !== undefined ? assertCardBrand(fields.brand) : this.brand
    const kind = fields.kind !== undefined ? assertCardKind(fields.kind) : this.kind
    const lastFourDigits =
      fields.lastFourDigits !== undefined
        ? Card.validLastDigits(fields.lastFourDigits)
        : this.lastFourDigits

    this.brand = brand
    this.kind = kind
    this.lastFourDigits = lastFourDigits
  }

  private static validLastDigits(lastFourDigits?: string): string {
    const trimmed = lastFourDigits?.trim() ?? ''
    if (!Card.LAST_DIGITS_REGEX.test(trimmed)) {
      ValidationError.throwError(Errors.INVALID_CARD_LAST_DIGITS, lastFourDigits)
    }
    return trimmed
  }
}
