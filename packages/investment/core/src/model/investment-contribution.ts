import { Entity, EntityProps, Money, ValidationError, Errors } from 'shared'

export interface InvestmentContributionProps extends EntityProps {
  ownerId?: string
  investmentId?: string
  // INTEGER CENTS, always positive: taking money OUT is a redemption, which is
  // a different thing and not what this records.
  amount?: number
  // The DAY the money moved. Time of day is meaningless here, and a date is
  // what lets the month know how much of its leftover was already put to work.
  occurredOn?: Date
}

/**
 * Money put into an investment after it was opened — an "aporte".
 *
 * It is its own row, rather than only a bump to the investment's applied
 * amount, for two reasons: it is what EXPLAINS why that amount grew, and it is
 * what lets a month say how much of its leftover has already been invested
 * (see the monthly report). Without it, the applied amount would grow with no
 * record of when or why.
 */
export class InvestmentContribution extends Entity<
  InvestmentContribution,
  InvestmentContributionProps
> {
  readonly ownerId: string
  readonly investmentId: string
  readonly amount: Money
  readonly occurredOn: Date

  constructor(props: InvestmentContributionProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')
    const investmentId = props.investmentId?.trim() ?? ''
    if (!investmentId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'investmentId')

    this.ownerId = ownerId
    this.investmentId = investmentId
    this.amount = InvestmentContribution.validAmount(props.amount)
    this.occurredOn = InvestmentContribution.validDate(props.occurredOn)
  }

  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  /** Money already refuses negatives; zero is refused here — putting nothing in
   * is not putting anything in. */
  private static validAmount(amount?: number): Money {
    const money = new Money(amount ?? 0)
    if (money.isZero()) ValidationError.throwError(Errors.INVALID_AMOUNT, amount)
    return money
  }

  private static validDate(occurredOn?: Date): Date {
    if (!occurredOn || Number.isNaN(occurredOn.getTime())) {
      ValidationError.throwError(Errors.REQUIRED_FIELD, 'occurredOn')
    }
    return occurredOn as Date
  }
}
