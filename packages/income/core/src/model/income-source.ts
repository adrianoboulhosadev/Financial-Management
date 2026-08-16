import { Entity, EntityProps, Money, ValidationError, Errors } from 'shared'

export interface IncomeSourceProps extends EntityProps {
  ownerId?: string
  name?: string
  // Monthly amount, in INTEGER CENTS.
  amount?: number
  // Day of the month it lands (1-31).
  payday?: number
  active?: boolean
}

/**
 * A recurring source of income — a salary, a retainer. This is the PLANNED side
 * of the month: it does not post transactions by itself, so it can never double
 * count against a one-off income the owner also recorded by hand. "How much is
 * left this month" starts here.
 *
 * A source that stopped paying is DEACTIVATED, not deleted: dropping the row
 * would erase the record of what the plan used to be.
 */
export class IncomeSource extends Entity<IncomeSource, IncomeSourceProps> {
  static readonly MIN_PAYDAY = 1
  static readonly MAX_PAYDAY = 31

  readonly ownerId: string
  name: string
  amount: Money
  payday: number
  active: boolean

  constructor(props: IncomeSourceProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')

    this.ownerId = ownerId
    this.name = IncomeSource.validName(props.name)
    this.amount = IncomeSource.validAmount(props.amount)
    this.payday = IncomeSource.validPayday(props.payday)
    this.active = props.active ?? true
  }

  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  /** Validated before anything is assigned, so a rejected edit leaves the
   * source exactly as it was. */
  edit(fields: { name?: string; amount?: number; payday?: number }): void {
    const name = fields.name !== undefined ? IncomeSource.validName(fields.name) : this.name
    const amount =
      fields.amount !== undefined ? IncomeSource.validAmount(fields.amount) : this.amount
    const payday =
      fields.payday !== undefined ? IncomeSource.validPayday(fields.payday) : this.payday

    this.name = name
    this.amount = amount
    this.payday = payday
  }

  /** Stopped paying — kept on the books, just out of the monthly total. */
  deactivate(): void {
    this.active = false
  }

  activate(): void {
    this.active = true
  }

  private static validName(name?: string): string {
    const trimmed = name?.trim() ?? ''
    if (!trimmed) ValidationError.throwError(Errors.REQUIRED_FIELD, 'name')
    return trimmed
  }

  private static validAmount(amount?: number): Money {
    const money = new Money(amount ?? 0)
    if (money.isZero()) ValidationError.throwError(Errors.INVALID_AMOUNT, amount)
    return money
  }

  private static validPayday(payday?: number): number {
    const day = payday ?? 0
    if (
      !Number.isInteger(day) ||
      day < IncomeSource.MIN_PAYDAY ||
      day > IncomeSource.MAX_PAYDAY
    ) {
      ValidationError.throwError(Errors.INVALID_PAYDAY, payday)
    }
    return day
  }
}
