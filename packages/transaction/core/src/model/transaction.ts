import { Entity, EntityProps, Money, ValidationError, Errors } from 'shared'
import { TransactionType, assertTransactionType } from './transaction-type'

export interface TransactionProps extends EntityProps {
  ownerId?: string
  type?: string
  // Logical FK to a LEAF category (cross-context). Required for an expense —
  // that is what makes the tree worth having; optional for a one-off income.
  categoryId?: string | null
  description?: string
  // INTEGER CENTS, always positive. The direction lives in `type`.
  amount?: number
  // The DAY the money moved. Time of day is meaningless here and would only
  // create timezone edge cases at the month boundary.
  occurredOn?: Date
  attachmentUrl?: string | null
  // Set when a Recurrence materialized this row (see RunRecurrence).
  recurrenceId?: string | null
}

/**
 * A recorded movement of money. Rich entity: the constructor builds the Money
 * value object and enforces every invariant, so an expense with no category, a
 * zero amount or an unknown type simply cannot exist as a Transaction — whether
 * it came from the API, from a recurrence or from a database row.
 */
export class Transaction extends Entity<Transaction, TransactionProps> {
  readonly ownerId: string
  readonly type: TransactionType
  categoryId: string | null
  description: string
  amount: Money
  occurredOn: Date
  attachmentUrl: string | null
  readonly recurrenceId: string | null

  constructor(props: TransactionProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')

    this.ownerId = ownerId
    this.type = assertTransactionType(props.type)
    this.categoryId = props.categoryId ?? null
    this.description = Transaction.validDescription(props.description)
    this.amount = Transaction.validAmount(props.amount)
    this.occurredOn = Transaction.validDate(props.occurredOn)
    this.attachmentUrl = props.attachmentUrl ?? null
    this.recurrenceId = props.recurrenceId ?? null

    Transaction.ensureCategoryWhenExpense(this.type, this.categoryId)
  }

  get isExpense(): boolean {
    return this.type === 'expense'
  }

  /** True when this row belongs to the given user — the anti-IDOR check every
   * use case runs before touching it. */
  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  /**
   * Edits the mutable fields; `type` is fixed at creation (an expense that
   * became an income is a different record, not an edit). Every rule is
   * re-applied, so an edit can never sneak past what creation rejects.
   *
   * Everything is validated BEFORE anything is assigned: a rejected edit leaves
   * the entity exactly as it was, instead of a half-applied state that the next
   * call would then trip over.
   */
  edit(fields: {
    categoryId?: string | null
    description?: string
    amount?: number
    occurredOn?: Date
    attachmentUrl?: string | null
  }): void {
    const categoryId = fields.categoryId !== undefined ? fields.categoryId : this.categoryId
    const description =
      fields.description !== undefined
        ? Transaction.validDescription(fields.description)
        : this.description
    const amount = fields.amount !== undefined ? Transaction.validAmount(fields.amount) : this.amount
    const occurredOn =
      fields.occurredOn !== undefined ? Transaction.validDate(fields.occurredOn) : this.occurredOn
    Transaction.ensureCategoryWhenExpense(this.type, categoryId)

    this.categoryId = categoryId
    this.description = description
    this.amount = amount
    this.occurredOn = occurredOn
    if (fields.attachmentUrl !== undefined) this.attachmentUrl = fields.attachmentUrl
  }

  private static ensureCategoryWhenExpense(
    type: TransactionType,
    categoryId: string | null,
  ): void {
    if (type === 'expense' && !categoryId) {
      ValidationError.throwError(Errors.CATEGORY_REQUIRED_FOR_EXPENSE)
    }
  }

  private static validDescription(description?: string): string {
    const trimmed = description?.trim() ?? ''
    if (!trimmed) ValidationError.throwError(Errors.REQUIRED_FIELD, 'description')
    return trimmed
  }

  /** Money already refuses negatives; zero is refused here — a movement of
   * nothing is not a movement. */
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
