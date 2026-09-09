import { Entity, EntityProps, Money, MonthPeriod, ValidationError, Errors } from 'shared'

export interface RecurrencePaymentProps extends EntityProps {
  ownerId?: string
  recurrenceId?: string
  // YYYY-MM — the competence month, validated by the MonthPeriod value object.
  period?: string
  // What the bill actually came to, in INTEGER CENTS. Null while nobody has
  // said — the estimate on the recurrence still stands.
  amount?: number | null
  // When the owner ticked it off. Null means still to pay.
  paidAt?: Date | null
}

/**
 * What the owner did about ONE month of ONE recurrence: ticked it off, and/or
 * (for a variable bill) what it actually came to.
 *
 * It exists to record a DEVIATION from the default, which is why the checklist
 * needs nothing created in advance: a month nobody touched has no row and reads
 * as "not paid, costs the estimate". That is also what keeps a year of untouched
 * months from costing a year of writes.
 *
 * Whether an amount may be set at all is NOT decided here — it depends on the
 * recurrence being variable, and an entity cannot see its sibling. The use case
 * carries that rule (see AdjustRecurrenceMonth).
 */
export class RecurrencePayment extends Entity<RecurrencePayment, RecurrencePaymentProps> {
  readonly ownerId: string
  readonly recurrenceId: string
  readonly period: MonthPeriod
  amount: Money | null
  paidAt: Date | null

  constructor(props: RecurrencePaymentProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')
    const recurrenceId = props.recurrenceId?.trim() ?? ''
    if (!recurrenceId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'recurrenceId')

    this.ownerId = ownerId
    this.recurrenceId = recurrenceId
    this.period = new MonthPeriod(props.period)
    this.amount = RecurrencePayment.validAmount(props.amount)
    this.paidAt = props.paidAt ?? null
  }

  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  get isPaid(): boolean {
    return this.paidAt !== null
  }

  /** Ticked off. Idempotent on purpose — ticking an already-paid month must not
   * move the date it was paid on. */
  markPaid(paidAt: Date = new Date()): void {
    if (this.paidAt) return
    this.paidAt = paidAt
  }

  /** Un-ticked, because the owner ticked it by mistake. The adjusted amount
   * survives: what the bill came to is true whether or not it is settled. */
  markUnpaid(): void {
    this.paidAt = null
  }

  /** What the bill came to this month. `null` puts the recurrence's estimate
   * back in charge. */
  adjustAmount(amount: number | null): void {
    this.amount = RecurrencePayment.validAmount(amount)
  }

  /** Nothing left to remember: not paid, and no amount of its own. A row in
   * that state is noise the repository can drop. */
  get isEmpty(): boolean {
    return this.paidAt === null && this.amount === null
  }

  /** Money already refuses negatives; zero is refused too — a bill of nothing
   * is not a bill, and clearing the adjustment is what `null` is for. */
  private static validAmount(amount?: number | null): Money | null {
    if (amount === undefined || amount === null) return null
    const money = new Money(amount)
    if (money.isZero()) ValidationError.throwError(Errors.INVALID_AMOUNT, amount)
    return money
  }
}
