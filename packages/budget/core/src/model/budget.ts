import { Entity, EntityProps, Money, ValidationError, Errors } from 'shared'

export interface BudgetProps extends EntityProps {
  ownerId?: string
  // Logical FK to a LEAF category (cross-context). One ceiling per category.
  categoryId?: string
  // INTEGER CENTS.
  amount?: number
}

/**
 * A monthly spending ceiling for one category ("lazer = R$500"). It RECURS: the
 * same ceiling applies to every month and how much is left is computed live from
 * that month's transactions, so nothing is stored per month and there is no
 * ceiling to recreate in January.
 *
 * The budget never BLOCKS a purchase — money already spent is a fact, and
 * refusing to record it would only make the numbers lie. Crossing it raises a
 * notification instead (see the budget alert in the worker).
 */
export class Budget extends Entity<Budget, BudgetProps> {
  readonly ownerId: string
  readonly categoryId: string
  amount: Money

  constructor(props: BudgetProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')
    const categoryId = props.categoryId?.trim() ?? ''
    if (!categoryId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'categoryId')

    this.ownerId = ownerId
    this.categoryId = categoryId
    this.amount = Budget.validAmount(props.amount)
  }

  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  /** Raising or lowering the ceiling takes effect immediately: unlike a
   * protective limit, a budget is a plan the owner sets for themselves, so
   * there is nothing to defend against a change of mind. */
  changeAmount(amount: number): void {
    this.amount = Budget.validAmount(amount)
  }

  /** Money already refuses negatives; a zero ceiling is refused here — "I may
   * not spend anything on this" is expressed by having no budget at all. */
  private static validAmount(amount?: number): Money {
    const money = new Money(amount ?? 0)
    if (money.isZero()) ValidationError.throwError(Errors.INVALID_AMOUNT, amount)
    return money
  }
}
