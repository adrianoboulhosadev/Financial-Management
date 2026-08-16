import { ValidationError } from '../errors/validation-error'
import { Errors } from '../constants/errors'

/**
 * The month a record belongs to ("competência"), as the YYYY-MM string the API
 * and the front already speak. It lives in the kernel because THREE contexts
 * reason in months and none of them owns the concept: a budget ceiling is
 * monthly, an income source pays monthly, and a transaction is summed by month.
 *
 * Everything is computed in UTC — the same clock Postgres stores timestamps in.
 * Building the window from local time would drift the boundary by the offset
 * and silently move the first/last day's records into the neighbouring month.
 *
 * Immutable: `previous`/`next` return a new MonthPeriod.
 */
export class MonthPeriod {
  static readonly REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

  readonly value: string
  readonly year: number
  /** 1-12 (NOT the 0-based month of the Date API). */
  readonly month: number

  constructor(value?: string) {
    this.value = value?.trim() ?? ''
    if (!MonthPeriod.isValid(this.value)) {
      ValidationError.throwError(Errors.INVALID_PERIOD, this.value)
    }
    const [year, month] = this.value.split('-')
    this.year = Number(year)
    this.month = Number(month)
  }

  static isValid(value: string): boolean {
    return MonthPeriod.REGEX.test(value)
  }

  /** The month a given instant falls into (defaults to now). */
  static of(reference: Date = new Date()): MonthPeriod {
    const month = `${reference.getUTCMonth() + 1}`.padStart(2, '0')
    return new MonthPeriod(`${reference.getUTCFullYear()}-${month}`)
  }

  /** First instant of the month (inclusive lower bound of the window). */
  get start(): Date {
    return new Date(Date.UTC(this.year, this.month - 1, 1))
  }

  /**
   * First instant of the NEXT month — an EXCLUSIVE upper bound. Querying with
   * `< end` covers the whole last day whatever its time component is, which a
   * `<= lastDay` bound built at midnight would cut off.
   */
  get end(): Date {
    return new Date(Date.UTC(this.year, this.month, 1))
  }

  get daysInMonth(): number {
    return new Date(Date.UTC(this.year, this.month, 0)).getUTCDate()
  }

  /**
   * A day inside this month, CLAMPED to its last day — day 31 in February lands
   * on the 28th (29th on a leap year). Recurrences carry a fixed day of month,
   * so without the clamp "every 31st" would either skip short months or roll
   * over into the next one.
   */
  dayAt(dayOfMonth: number): Date {
    const day = Math.min(Math.max(dayOfMonth, 1), this.daysInMonth)
    return new Date(Date.UTC(this.year, this.month - 1, day))
  }

  previous(): MonthPeriod {
    return MonthPeriod.of(new Date(Date.UTC(this.year, this.month - 2, 1)))
  }

  next(): MonthPeriod {
    return MonthPeriod.of(new Date(Date.UTC(this.year, this.month, 1)))
  }

  equals(other?: MonthPeriod): boolean {
    return !!other && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
