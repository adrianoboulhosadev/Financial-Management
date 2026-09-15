import { Entity, EntityProps, Money, ValidationError, Errors } from 'shared'
import { CardKind, assertCardKind } from './card-kind'
import { CardBrand, assertCardBrand } from './card-brand'
import { InvoiceSchedule } from './invoice-schedule'

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
  // The invoice calendar, as the two days the bank prints on the statement.
  // Both null on a card registered before invoices existed, and on every debit
  // card — the entity has to be able to reconstitute those rows unchanged.
  closingDay?: number | null
  dueDay?: number | null
  // The credit limit, in INTEGER CENTS. Optional: knowing it turns the invoice
  // into a gauge, and not knowing it still leaves the invoice readable.
  limitCents?: number | null
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
 *
 * On CREDIT it also carries the invoice calendar and the limit, and both are
 * gated by `allowsCredit`: a debit card has no invoice to close and no limit to
 * spend against, so letting it hold either would put a number on screen that
 * means nothing.
 */
export class Card extends Entity<Card, CardProps> {
  static readonly LAST_DIGITS_REGEX = /^\d{4}$/

  readonly ownerId: string
  readonly bankId: string
  brand: CardBrand
  kind: CardKind
  lastFourDigits: string
  schedule: InvoiceSchedule | null
  limit: Money | null

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
    this.schedule = InvoiceSchedule.optional(props)
    this.limit = Card.validLimit(props.limitCents)
    Card.assertCreditDetails(this.kind, this.schedule, this.limit)
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

  /** Whether this card knows when its invoice closes — without that, there is
   * no invoice to show, only a list of charges. */
  get hasInvoice(): boolean {
    return this.schedule !== null
  }

  /**
   * The bank never changes (a card moved to another bank is another card).
   * Validated before anything is assigned, so a rejected edit leaves the card
   * exactly as it was.
   *
   * The calendar is edited as a PAIR even when only one day is passed: the day
   * left out keeps its current value, and passing null for both clears the
   * calendar. That is also what lets a card be turned into a debit-only one —
   * clearing the credit details in the SAME edit — instead of being stuck as
   * credit forever because of two days set months ago.
   */
  edit(fields: {
    brand?: string
    kind?: string
    lastFourDigits?: string
    closingDay?: number | null
    dueDay?: number | null
    limitCents?: number | null
  }): void {
    const brand = fields.brand !== undefined ? assertCardBrand(fields.brand) : this.brand
    const kind = fields.kind !== undefined ? assertCardKind(fields.kind) : this.kind
    const lastFourDigits =
      fields.lastFourDigits !== undefined
        ? Card.validLastDigits(fields.lastFourDigits)
        : this.lastFourDigits

    const schedule = InvoiceSchedule.optional({
      closingDay:
        fields.closingDay !== undefined ? fields.closingDay : (this.schedule?.closingDay ?? null),
      dueDay: fields.dueDay !== undefined ? fields.dueDay : (this.schedule?.dueDay ?? null),
    })
    const limit =
      fields.limitCents !== undefined ? Card.validLimit(fields.limitCents) : this.limit

    Card.assertCreditDetails(kind, schedule, limit)

    this.brand = brand
    this.kind = kind
    this.lastFourDigits = lastFourDigits
    this.schedule = schedule
    this.limit = limit
  }

  private static assertCreditDetails(
    kind: CardKind,
    schedule: InvoiceSchedule | null,
    limit: Money | null,
  ): void {
    if (kind === 'credit' || kind === 'both') return
    if (schedule) ValidationError.throwError(Errors.CARD_NOT_CREDIT, kind)
    if (limit) ValidationError.throwError(Errors.CARD_NOT_CREDIT, kind)
  }

  /** Money already refuses negatives; a zero limit is refused here — a card
   * that may not be used for anything is not a card with a limit of nothing. */
  private static validLimit(limitCents?: number | null): Money | null {
    if (limitCents == null) return null
    const money = new Money(limitCents)
    if (money.isZero()) ValidationError.throwError(Errors.INVALID_AMOUNT, limitCents)
    return money
  }

  private static validLastDigits(lastFourDigits?: string): string {
    const trimmed = lastFourDigits?.trim() ?? ''
    if (!Card.LAST_DIGITS_REGEX.test(trimmed)) {
      ValidationError.throwError(Errors.INVALID_CARD_LAST_DIGITS, lastFourDigits)
    }
    return trimmed
  }
}
