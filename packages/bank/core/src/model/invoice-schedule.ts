import { MonthPeriod, ValidationError, Errors } from 'shared'

export interface InvoiceScheduleProps {
  // Day the invoice CLOSES: everything bought up to it goes on this one, and
  // everything after it already belongs to the next.
  closingDay?: number | null
  // Day the closed invoice has to be PAID.
  dueDay?: number | null
}

/**
 * The calendar of a credit card: when its invoice closes and when it is due.
 *
 * It is a value object and not two columns read straight off the card because
 * the pair carries a rule of its own — which invoice a purchase lands on — and
 * that rule is the whole reason the days are stored. Keeping it here means the
 * front, the backend and the calculator all answer that question the same way
 * instead of each re-deriving it from two integers.
 *
 * An invoice is identified by the month it CLOSES in. Closing happens exactly
 * once a month, so the month is a clean key, and it is the window the charges
 * actually belong to — the due date is a consequence of it, not the other way
 * around.
 *
 * Immutable: changing the calendar builds a new schedule.
 */
export class InvoiceSchedule {
  static readonly MIN_DAY = 1
  static readonly MAX_DAY = 31

  readonly closingDay: number
  readonly dueDay: number

  constructor(props: InvoiceScheduleProps) {
    this.closingDay = InvoiceSchedule.validDay(props.closingDay)
    this.dueDay = InvoiceSchedule.validDay(props.dueDay)
  }

  /**
   * Builds a schedule only when BOTH days are given, and null when neither is —
   * one without the other is not half a calendar, it is no calendar, and the
   * constructor refuses it.
   */
  static optional(props: InvoiceScheduleProps): InvoiceSchedule | null {
    const { closingDay, dueDay } = props
    if (closingDay == null && dueDay == null) return null
    return new InvoiceSchedule(props)
  }

  /**
   * The invoice a purchase made on `date` lands on, named by the month it
   * closes in.
   *
   * The comparison is against the CLAMPED closing day, which is what makes a
   * card that closes on the 31st behave in February: it closes on the 28th
   * there, so a purchase on the 28th is still inside that invoice instead of
   * being pushed to March by a day the month does not have.
   */
  periodOf(date: Date): MonthPeriod {
    const period = MonthPeriod.of(date)
    const closing = Math.min(this.closingDay, period.daysInMonth)
    return date.getUTCDate() <= closing ? period : period.next()
  }

  /** The day the invoice of `period` closes (clamped to a short month). */
  closesOn(period: MonthPeriod): Date {
    return period.dayAt(this.closingDay)
  }

  /**
   * The day the invoice of `period` must be paid. It falls in the SAME month
   * when the due day comes after the closing day, and in the next one
   * otherwise — including when the two are equal, because an invoice that
   * closed today is never payable today.
   */
  dueOn(period: MonthPeriod): Date {
    const month = this.dueDay > this.closingDay ? period : period.next()
    return month.dayAt(this.dueDay)
  }

  equals(other?: InvoiceSchedule | null): boolean {
    return !!other && this.closingDay === other.closingDay && this.dueDay === other.dueDay
  }

  private static validDay(day?: number | null): number {
    if (
      !Number.isInteger(day) ||
      (day as number) < InvoiceSchedule.MIN_DAY ||
      (day as number) > InvoiceSchedule.MAX_DAY
    ) {
      ValidationError.throwError(Errors.INVALID_INVOICE_DAY, day)
    }
    return day as number
  }
}
