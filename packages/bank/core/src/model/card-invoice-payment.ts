import { Entity, EntityProps, MonthPeriod, ValidationError, Errors } from 'shared'

export interface CardInvoicePaymentProps extends EntityProps {
  ownerId?: string
  cardId?: string
  // YYYY-MM — the month the invoice CLOSES in, which is the invoice's identity.
  period?: string
  // When the owner ticked it off. Null means still to pay.
  paidAt?: Date | null
}

/**
 * What the owner did about ONE invoice of ONE card: ticked it off, or not.
 *
 * Like `RecurrencePayment`, it records a DEVIATION from the default, so the
 * payable list needs nothing created in advance: an invoice nobody touched has
 * no row and reads as "still to pay". That is what keeps a year of invoices
 * from costing a year of writes, and what lets the amount stay COMPUTED — the
 * charges already say what the invoice is worth, so storing it again would only
 * create a second number to disagree with.
 *
 * The period is the CLOSING month and never the due month: closing is what the
 * charges belong to, and a card whose due day precedes its closing day pays in
 * the following month — keying on the due month would make the same invoice
 * answer to two different names depending on the card.
 */
export class CardInvoicePayment extends Entity<CardInvoicePayment, CardInvoicePaymentProps> {
  readonly ownerId: string
  readonly cardId: string
  readonly period: MonthPeriod
  paidAt: Date | null

  constructor(props: CardInvoicePaymentProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')
    const cardId = props.cardId?.trim() ?? ''
    if (!cardId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'cardId')

    this.ownerId = ownerId
    this.cardId = cardId
    this.period = new MonthPeriod(props.period)
    this.paidAt = props.paidAt ?? null
  }

  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  get isPaid(): boolean {
    return this.paidAt !== null
  }

  /** Ticked off. Idempotent on purpose — ticking an already-paid invoice must
   * not move the date it was paid on. */
  markPaid(paidAt: Date = new Date()): void {
    if (this.paidAt) return
    this.paidAt = paidAt
  }

  markUnpaid(): void {
    this.paidAt = null
  }

  /** Nothing left to remember. A row in that state is noise the repository can
   * drop — the list reads the same either way. */
  get isEmpty(): boolean {
    return this.paidAt === null
  }
}
