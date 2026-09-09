import { Entity, EntityProps, Money, ValidationError, Errors } from 'shared'
import { TransactionType, assertTransactionType } from './transaction-type'
import { PaymentMethod, assertPaymentMethod } from './payment-method'

export interface TransactionProps extends EntityProps {
  ownerId?: string
  type?: string
  // Logical FK to a category (cross-context) — ANY node of the tree serves,
  // branch or leaf, because how deep to file is the owner's call. Required for
  // an expense (that is what makes the tree worth having), optional for a
  // one-off income.
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
  // Which account/card the money went through and how. Logical FKs to the
  // `bank` context; all optional, because every row written before banks
  // existed has none and still has to reconstitute unchanged.
  bankId?: string | null
  cardId?: string | null
  paymentMethod?: string | null
  // A credit purchase split over N months. Each month is its own row (see
  // InstallmentPlanner), they share an `installmentGroupId`, and each knows
  // which of the N it is — so next month's charge is visible today instead of
  // appearing only when the card bills it.
  installments?: number
  installmentNumber?: number
  installmentGroupId?: string | null
}

/**
 * A recorded movement of money. Rich entity: the constructor builds the Money
 * value object and enforces every invariant, so an expense with no category, a
 * zero amount or an unknown type simply cannot exist as a Transaction — whether
 * it came from the API, from a recurrence or from a database row.
 */
export class Transaction extends Entity<Transaction, TransactionProps> {
  static readonly MIN_INSTALLMENTS = 1
  /** Four years of instalments. Past that it is a financing agreement, not a
   * purchase, and the list stops being something anyone reads. */
  static readonly MAX_INSTALLMENTS = 48

  readonly ownerId: string
  readonly type: TransactionType
  categoryId: string | null
  description: string
  amount: Money
  occurredOn: Date
  attachmentUrl: string | null
  readonly recurrenceId: string | null
  bankId: string | null
  cardId: string | null
  paymentMethod: PaymentMethod | null
  readonly installments: number
  readonly installmentNumber: number
  readonly installmentGroupId: string | null

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
    this.bankId = props.bankId ?? null
    this.cardId = props.cardId ?? null
    this.paymentMethod = assertPaymentMethod(props.paymentMethod)
    this.installments = Transaction.validInstallments(props.installments)
    this.installmentNumber = Transaction.validInstallmentNumber(
      props.installmentNumber,
      this.installments,
    )
    this.installmentGroupId = props.installmentGroupId ?? null

    Transaction.ensureCategoryWhenExpense(this.type, this.categoryId)
    Transaction.ensureCreditWhenSplit(this.installments, this.paymentMethod)
  }

  get isExpense(): boolean {
    return this.type === 'expense'
  }

  /** Part of a purchase paid over several months — worth saying on screen, so
   * a row for a month the card has not billed yet is not read as a surprise. */
  get isInstallment(): boolean {
    return this.installments > 1
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
    bankId?: string | null
    cardId?: string | null
    paymentMethod?: string | null
  }): void {
    const categoryId = fields.categoryId !== undefined ? fields.categoryId : this.categoryId
    const description =
      fields.description !== undefined
        ? Transaction.validDescription(fields.description)
        : this.description
    const amount = fields.amount !== undefined ? Transaction.validAmount(fields.amount) : this.amount
    const occurredOn =
      fields.occurredOn !== undefined ? Transaction.validDate(fields.occurredOn) : this.occurredOn
    const paymentMethod =
      fields.paymentMethod !== undefined
        ? assertPaymentMethod(fields.paymentMethod)
        : this.paymentMethod
    Transaction.ensureCategoryWhenExpense(this.type, categoryId)
    // The split itself is fixed at creation (changing 6x into 3x is a different
    // set of rows), so an edit may not leave one pointing at a method that
    // cannot be split.
    Transaction.ensureCreditWhenSplit(this.installments, paymentMethod)

    this.categoryId = categoryId
    this.description = description
    this.amount = amount
    this.occurredOn = occurredOn
    this.paymentMethod = paymentMethod
    if (fields.attachmentUrl !== undefined) this.attachmentUrl = fields.attachmentUrl
    if (fields.bankId !== undefined) this.bankId = fields.bankId
    if (fields.cardId !== undefined) this.cardId = fields.cardId
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

  /** Splitting is a credit-card thing: pix, debit and the rest settle at once,
   * so "3x no pix" is not a state the product should be able to hold. */
  private static ensureCreditWhenSplit(
    installments: number,
    paymentMethod: PaymentMethod | null,
  ): void {
    if (installments > 1 && paymentMethod !== 'credit') {
      ValidationError.throwError(Errors.INSTALLMENTS_REQUIRE_CREDIT, paymentMethod)
    }
  }

  private static validInstallments(installments?: number): number {
    const count = installments ?? Transaction.MIN_INSTALLMENTS
    if (
      !Number.isInteger(count) ||
      count < Transaction.MIN_INSTALLMENTS ||
      count > Transaction.MAX_INSTALLMENTS
    ) {
      ValidationError.throwError(Errors.INVALID_INSTALLMENTS, installments)
    }
    return count
  }

  /** "Which of the N is this" only makes sense inside 1..N — a 4/3 is not a
   * row anybody could read. */
  private static validInstallmentNumber(installmentNumber: number | undefined, total: number): number {
    const number = installmentNumber ?? 1
    if (!Number.isInteger(number) || number < 1 || number > total) {
      ValidationError.throwError(Errors.INVALID_INSTALLMENTS, installmentNumber)
    }
    return number
  }

  private static validDate(occurredOn?: Date): Date {
    if (!occurredOn || Number.isNaN(occurredOn.getTime())) {
      ValidationError.throwError(Errors.REQUIRED_FIELD, 'occurredOn')
    }
    return occurredOn as Date
  }
}
