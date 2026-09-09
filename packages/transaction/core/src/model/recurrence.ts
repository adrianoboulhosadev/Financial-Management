import { Entity, EntityProps, Money, MonthPeriod, ValidationError, Errors } from 'shared'
import { TransactionType, assertTransactionType } from './transaction-type'
import { PaymentMethod, assertPaymentMethod } from './payment-method'

export interface RecurrenceProps extends EntityProps {
  ownerId?: string
  type?: string
  categoryId?: string | null
  description?: string
  amount?: number
  // The day of the month the money moves (1-31). A day the month does not have
  // is CLAMPED, never rolled over — see MonthPeriod.dayAt.
  dayOfMonth?: number
  active?: boolean
  /**
   * A bill whose amount changes every month (the electricity one). `amount` is
   * then only the ESTIMATE the owner typed, and the month's real figure lands
   * in a RecurrencePayment when the bill arrives.
   *
   * Declared at CREATION and not editable afterwards: it is what decides
   * whether adjusting a month is allowed at all, and flipping it on a
   * recurrence that already has adjusted months would leave figures nobody
   * could explain.
   */
  variableAmount?: boolean
  // Already on pix/direct debit: the month settles on its due date, with
  // nobody ticking it off in the checklist.
  autoPaid?: boolean
  // Which account/card it is paid through and how — logical FKs to the `bank`
  // context, all optional for the same reason a movement's are.
  bankId?: string | null
  cardId?: string | null
  paymentMethod?: string | null
  // When this recurrence is next due. Kept as state (not only as a job in
  // Redis) so a lost job can always be recovered from the row itself.
  nextRunAt?: Date
  lastRunAt?: Date | null
}

/**
 * A fixed monthly movement (rent, streaming, salary) that the worker turns into
 * a real Transaction every month. Rich entity: it owns the scheduling rule —
 * when it is next due, how a day the month lacks is resolved, and what advancing
 * after a run means.
 *
 * It also owns the two things the month's checklist reads off it: whether its
 * amount VARIES (so a month may be adjusted when the bill arrives) and whether
 * it settles by ITSELF (pix/direct debit, so nobody has to tick it off).
 */
export class Recurrence extends Entity<Recurrence, RecurrenceProps> {
  static readonly MIN_DAY = 1
  static readonly MAX_DAY = 31

  readonly ownerId: string
  readonly type: TransactionType
  categoryId: string | null
  description: string
  amount: Money
  dayOfMonth: number
  active: boolean
  readonly variableAmount: boolean
  autoPaid: boolean
  bankId: string | null
  cardId: string | null
  paymentMethod: PaymentMethod | null
  nextRunAt: Date
  lastRunAt: Date | null

  constructor(props: RecurrenceProps) {
    super(props)
    const ownerId = props.ownerId?.trim() ?? ''
    if (!ownerId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'ownerId')

    this.ownerId = ownerId
    this.type = assertTransactionType(props.type)
    this.categoryId = props.categoryId ?? null
    this.description = Recurrence.validDescription(props.description)
    this.amount = Recurrence.validAmount(props.amount)
    this.dayOfMonth = Recurrence.validDay(props.dayOfMonth)
    this.active = props.active ?? true
    this.variableAmount = props.variableAmount ?? false
    this.autoPaid = props.autoPaid ?? false
    this.bankId = props.bankId ?? null
    this.cardId = props.cardId ?? null
    this.paymentMethod = assertPaymentMethod(props.paymentMethod)
    // A brand-new recurrence has no schedule yet: it starts at its next
    // occurrence from today. Reconstituting a row always brings its own.
    this.nextRunAt = props.nextRunAt ?? Recurrence.nextOccurrenceFrom(this.dayOfMonth, new Date())
    this.lastRunAt = props.lastRunAt ?? null

    Recurrence.ensureCategoryWhenExpense(this.type, this.categoryId)
  }

  get isExpense(): boolean {
    return this.type === 'expense'
  }

  /**
   * What this recurrence costs in a month nobody has adjusted. For a fixed one
   * that IS the amount; for a variable one it is only the owner's estimate,
   * which is still the honest thing to plan the month with until the bill
   * arrives.
   */
  get estimatedCents(): number {
    return this.amount.cents
  }

  belongsTo(userId: string): boolean {
    return this.ownerId === userId
  }

  /**
   * The next occurrence at or after `reference`: this month's day when it has
   * not passed yet, otherwise next month's. Compared at DAY granularity, so a
   * recurrence created on its own due day still posts today rather than waiting
   * a month.
   */
  static nextOccurrenceFrom(dayOfMonth: number, reference: Date): Date {
    const period = MonthPeriod.of(reference)
    const thisMonth = period.dayAt(dayOfMonth)
    const today = Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth(),
      reference.getUTCDate(),
    )
    return thisMonth.getTime() >= today ? thisMonth : period.next().dayAt(dayOfMonth)
  }

  /** The date the pending run should be filed under (the due day itself, so a
   * job that fires late still lands in the month it belongs to). */
  get dueOn(): Date {
    return MonthPeriod.of(this.nextRunAt).dayAt(this.dayOfMonth)
  }

  /**
   * Records that the due occurrence was posted and moves the schedule to the
   * following month. Refuses a paused recurrence — a job that fires after the
   * user paused it must not post anything.
   */
  markPosted(): void {
    if (!this.active) ValidationError.throwError(Errors.RECURRENCE_NOT_ACTIVE, this.id.value)
    const posted = this.dueOn
    this.lastRunAt = posted
    this.nextRunAt = MonthPeriod.of(posted).next().dayAt(this.dayOfMonth)
  }

  /**
   * Editing the day re-schedules from today; the other fields only affect the
   * rows posted from here on (history is never rewritten). Validated before
   * anything is assigned, so a rejected edit leaves the recurrence untouched.
   */
  edit(fields: {
    categoryId?: string | null
    description?: string
    amount?: number
    dayOfMonth?: number
    autoPaid?: boolean
    bankId?: string | null
    cardId?: string | null
    paymentMethod?: string | null
  }): void {
    const categoryId = fields.categoryId !== undefined ? fields.categoryId : this.categoryId
    const description =
      fields.description !== undefined
        ? Recurrence.validDescription(fields.description)
        : this.description
    const amount = fields.amount !== undefined ? Recurrence.validAmount(fields.amount) : this.amount
    const dayChanged = fields.dayOfMonth !== undefined && fields.dayOfMonth !== this.dayOfMonth
    const dayOfMonth = dayChanged ? Recurrence.validDay(fields.dayOfMonth) : this.dayOfMonth
    const paymentMethod =
      fields.paymentMethod !== undefined
        ? assertPaymentMethod(fields.paymentMethod)
        : this.paymentMethod
    Recurrence.ensureCategoryWhenExpense(this.type, categoryId)

    this.categoryId = categoryId
    this.description = description
    this.amount = amount
    this.paymentMethod = paymentMethod
    if (fields.autoPaid !== undefined) this.autoPaid = fields.autoPaid
    if (fields.bankId !== undefined) this.bankId = fields.bankId
    if (fields.cardId !== undefined) this.cardId = fields.cardId
    if (dayChanged) {
      this.dayOfMonth = dayOfMonth
      this.nextRunAt = Recurrence.nextOccurrenceFrom(dayOfMonth, new Date())
    }
  }

  /** Paused, not deleted: the rows it already posted stay exactly as they are. */
  pause(): void {
    this.active = false
  }

  /** Resuming re-schedules from today, so a recurrence paused for months does
   * not wake up owing every month it slept through. */
  resume(): void {
    this.active = true
    this.nextRunAt = Recurrence.nextOccurrenceFrom(this.dayOfMonth, new Date())
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

  private static validAmount(amount?: number): Money {
    const money = new Money(amount ?? 0)
    if (money.isZero()) ValidationError.throwError(Errors.INVALID_AMOUNT, amount)
    return money
  }

  private static validDay(dayOfMonth?: number): number {
    const day = dayOfMonth ?? 0
    if (!Number.isInteger(day) || day < Recurrence.MIN_DAY || day > Recurrence.MAX_DAY) {
      ValidationError.throwError(Errors.INVALID_DAY_OF_MONTH, dayOfMonth)
    }
    return day
  }
}
