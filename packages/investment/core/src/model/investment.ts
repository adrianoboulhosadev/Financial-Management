import { Entity, EntityProps, Money, ValidationError, Errors } from 'shared'
import { InvestmentKind, assertInvestmentKind } from './investment-kind'

export interface InvestmentProps extends EntityProps {
  ownerId?: string
  // Optional logical FK to the `bank` context: an investment held at a broker
  // the owner never registered still belongs on the list.
  bankId?: string | null
  name?: string
  kind?: string
  // What went IN, in INTEGER CENTS.
  investedAmount?: number
  // What it is worth TODAY, in cents. Absent until the owner updates it — the
  // product never invents a number it was not told.
  currentAmount?: number | null
  // The DAY the money was applied. Time of day is meaningless here.
  startedOn?: Date
  maturityOn?: Date | null
  notes?: string | null
  active?: boolean
}

/**
 * Money the owner put somewhere to grow. Rich entity: it owns what an
 * investment IS (a positive amount, a known kind, a start date) and what its
 * RETURN is — computed from the two amounts, never stored, so the figure on
 * screen can never drift from the figures it came from.
 *
 * An investment that was redeemed is DEACTIVATED, not deleted, for the same
 * reason an income source is: the record of what was done with the money is
 * worth keeping.
 */
export class Investment extends Entity<Investment, InvestmentProps> {
  static readonly MAX_NOTES_LENGTH = 500

  readonly ownerId: string
  bankId: string | null
  name: string
  kind: InvestmentKind
  investedAmount: Money
  currentAmount: Money | null
  startedOn: Date
  maturityOn: Date | null
  notes: string | null
  active: boolean

  constructor(props: InvestmentProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')

    this.ownerId = ownerId
    this.bankId = props.bankId ?? null
    this.name = Investment.validName(props.name)
    this.kind = assertInvestmentKind(props.kind)
    this.investedAmount = Investment.validAmount(props.investedAmount)
    this.currentAmount = Investment.validCurrent(props.currentAmount)
    this.startedOn = Investment.validDate(props.startedOn)
    this.maturityOn = props.maturityOn ?? null
    this.notes = Investment.validNotes(props.notes)
    this.active = props.active ?? true

    Investment.ensureMaturityAfterStart(this.startedOn, this.maturityOn)
  }

  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  /** What it is worth today — the current value once the owner has told us one,
   * otherwise what went in. Never a guess, never null: a portfolio adding up
   * "unknown" would add up to nothing. */
  get valueCents(): number {
    return (this.currentAmount ?? this.investedAmount).cents
  }

  /** What it has made (or lost) so far, in cents. SIGNED — this is the one
   * number in the product that is allowed to be negative, because "how much did
   * I lose" is exactly what the owner needs to see. */
  get returnCents(): number {
    return this.valueCents - this.investedAmount.cents
  }

  /**
   * Validated before anything is assigned, so a rejected edit leaves the
   * investment exactly as it was. `currentAmount` is the field that actually
   * gets touched month after month — that is how the return stays truthful.
   */
  edit(fields: {
    bankId?: string | null
    name?: string
    kind?: string
    investedAmount?: number
    currentAmount?: number | null
    startedOn?: Date
    maturityOn?: Date | null
    notes?: string | null
  }): void {
    const name = fields.name !== undefined ? Investment.validName(fields.name) : this.name
    const kind = fields.kind !== undefined ? assertInvestmentKind(fields.kind) : this.kind
    const investedAmount =
      fields.investedAmount !== undefined
        ? Investment.validAmount(fields.investedAmount)
        : this.investedAmount
    const currentAmount =
      fields.currentAmount !== undefined
        ? Investment.validCurrent(fields.currentAmount)
        : this.currentAmount
    const startedOn =
      fields.startedOn !== undefined ? Investment.validDate(fields.startedOn) : this.startedOn
    const maturityOn = fields.maturityOn !== undefined ? fields.maturityOn : this.maturityOn
    const notes = fields.notes !== undefined ? Investment.validNotes(fields.notes) : this.notes
    Investment.ensureMaturityAfterStart(startedOn, maturityOn)

    this.name = name
    this.kind = kind
    this.investedAmount = investedAmount
    this.currentAmount = currentAmount
    this.startedOn = startedOn
    this.maturityOn = maturityOn
    this.notes = notes
    if (fields.bankId !== undefined) this.bankId = fields.bankId
  }

  /** Redeemed or closed — off the portfolio total, still on the books. */
  deactivate(): void {
    this.active = false
  }

  activate(): void {
    this.active = true
  }

  /** A maturity before the application date is not a date the owner meant. */
  private static ensureMaturityAfterStart(startedOn: Date, maturityOn: Date | null): void {
    if (maturityOn && maturityOn.getTime() < startedOn.getTime()) {
      ValidationError.throwError(Errors.REQUIRED_FIELD, 'maturityOn')
    }
  }

  private static validName(name?: string): string {
    const trimmed = name?.trim() ?? ''
    if (!trimmed) ValidationError.throwError(Errors.REQUIRED_FIELD, 'name')
    return trimmed
  }

  /** Money already refuses negatives; zero is refused here — an investment of
   * nothing is not an investment. */
  private static validAmount(amount?: number): Money {
    const money = new Money(amount ?? 0)
    if (money.isZero()) ValidationError.throwError(Errors.INVALID_AMOUNT, amount)
    return money
  }

  /** Zero IS allowed here, unlike the applied amount: an investment really can
   * be worth nothing today, and refusing to record that would be a lie. */
  private static validCurrent(amount?: number | null): Money | null {
    if (amount === undefined || amount === null) return null
    return new Money(amount)
  }

  private static validDate(startedOn?: Date): Date {
    if (!startedOn || Number.isNaN(startedOn.getTime())) {
      ValidationError.throwError(Errors.REQUIRED_FIELD, 'startedOn')
    }
    return startedOn as Date
  }

  private static validNotes(notes?: string | null): string | null {
    const trimmed = notes?.trim() ?? ''
    if (!trimmed) return null
    if (trimmed.length > Investment.MAX_NOTES_LENGTH) {
      ValidationError.throwError(Errors.REQUIRED_FIELD, 'notes')
    }
    return trimmed
  }
}
