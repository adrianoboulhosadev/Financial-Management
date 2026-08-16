import { Entity, EntityProps, Money, MonthPeriod, ValidationError, Errors } from 'shared'
import { TransactionType, assertTransactionType } from './transaction-type'

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
    // A brand-new recurrence has no schedule yet: it starts at its next
    // occurrence from today. Reconstituting a row always brings its own.
    this.nextRunAt = props.nextRunAt ?? Recurrence.nextOccurrenceFrom(this.dayOfMonth, new Date())
    this.lastRunAt = props.lastRunAt ?? null

    Recurrence.ensureCategoryWhenExpense(this.type, this.categoryId)
  }

  get isExpense(): boolean {
    return this.type === 'expense'
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
  }): void {
    const categoryId = fields.categoryId !== undefined ? fields.categoryId : this.categoryId
    const description =
      fields.description !== undefined
        ? Recurrence.validDescription(fields.description)
        : this.description
    const amount = fields.amount !== undefined ? Recurrence.validAmount(fields.amount) : this.amount
    const dayChanged = fields.dayOfMonth !== undefined && fields.dayOfMonth !== this.dayOfMonth
    const dayOfMonth = dayChanged ? Recurrence.validDay(fields.dayOfMonth) : this.dayOfMonth
    Recurrence.ensureCategoryWhenExpense(this.type, categoryId)

    this.categoryId = categoryId
    this.description = description
    this.amount = amount
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
