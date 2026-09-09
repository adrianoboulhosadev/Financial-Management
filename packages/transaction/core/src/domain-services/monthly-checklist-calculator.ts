import { MonthPeriod } from 'shared'
import {
  ChecklistItemDTO,
  MonthlyChecklistDTO,
  RecurrenceDTO,
  RecurrencePaymentDTO,
} from '../model'
import { Countable } from './monthly-totals-calculator'

/**
 * Pure domain service (no ports, no side effects): what the owner still has to
 * pay this month.
 *
 * The checklist is DERIVED, never stored: one line per recurrence still OWED
 * that month, crossed with the deviations the owner recorded (a bill that came
 * in at a different amount, a month ticked off). Nothing is generated in
 * advance, so no month can be missing from it and an untouched month costs no
 * writes at all.
 *
 * It owns the three rules that decide what a line says:
 * - whether the line EXISTS at all: a paused recurrence is not owed, and
 *   neither is one whose deadline has passed — a course that lasted 8 months
 *   leaves the list on its own, without anyone remembering to pause it;
 * - what the month COSTS is the adjusted figure when the bill arrived,
 *   otherwise the recurrence's own amount (an estimate, for a variable one);
 * - what counts as PAID is either the owner ticking it off or the bill settling
 *   by itself (pix/direct debit) once its due day has passed — which is the
 *   whole point of `autoPaid`: nobody should have to tick off something the
 *   bank already took.
 */
export class MonthlyChecklistCalculator {
  static calculate(
    period: string,
    recurrences: RecurrenceDTO[],
    payments: RecurrencePaymentDTO[],
    /** Ids of the recurrences the worker already turned into a movement in this
     * month — the checklist still lists them, and the totals stop counting them
     * a second time. */
    postedRecurrenceIds: string[] = [],
    reference: Date = new Date(),
  ): MonthlyChecklistDTO {
    const month = new MonthPeriod(period)
    const paymentByRecurrence = new Map(
      payments.filter((payment) => payment.period === month.value).map((p) => [p.recurrenceId, p]),
    )
    const posted = new Set(postedRecurrenceIds)

    const items = recurrences
      .filter(
        (recurrence) =>
          recurrence.active && !MonthlyChecklistCalculator.endedBefore(recurrence, month),
      )
      .map((recurrence) =>
        MonthlyChecklistCalculator.itemOf(
          recurrence,
          month,
          paymentByRecurrence.get(recurrence.id) ?? null,
          posted.has(recurrence.id),
          reference,
        ),
      )
      // The order the bills fall due — which is the order they get paid in.
      .sort((left, right) => {
        if (left.dayOfMonth !== right.dayOfMonth) return left.dayOfMonth - right.dayOfMonth
        return left.description.localeCompare(right.description, 'pt-BR')
      })

    const expenses = items.filter((item) => item.type === 'expense')
    const totalCents = expenses.reduce((total, item) => total + item.amountCents, 0)
    const paidCents = expenses
      .filter((item) => item.paid)
      .reduce((total, item) => total + item.amountCents, 0)

    return { period: month.value, items, totalCents, paidCents, pendingCents: totalCents - paidCents }
  }

  /**
   * The month's fixed movements that have NOT been posted as a real one yet —
   * what the month already owes on top of what it has spent.
   *
   * A month that is already OVER commits to nothing: whatever it was going to
   * cost either got posted or never happened, and adding it now would rewrite a
   * closed month. That is why this takes a reference date instead of just
   * filtering on `posted`.
   */
  static commitmentsOf(
    checklist: MonthlyChecklistDTO,
    reference: Date = new Date(),
  ): Countable[] {
    const month = new MonthPeriod(checklist.period)
    if (month.end.getTime() <= reference.getTime()) return []

    return checklist.items
      .filter((item) => !item.posted)
      .map((item) => ({
        type: item.type,
        categoryId: item.categoryId,
        amount: item.amountCents,
      }))
  }

  /**
   * Whether the deadline falls before this month's due day. Restated here
   * rather than borrowed from the entity because the read side works over plain
   * rows and never builds one — the same reason `valueOf` is restated in the
   * portfolio calculator.
   */
  private static endedBefore(recurrence: RecurrenceDTO, month: MonthPeriod): boolean {
    if (!recurrence.endsOn) return false
    return month.dayAt(recurrence.dayOfMonth).getTime() > new Date(recurrence.endsOn).getTime()
  }

  private static itemOf(
    recurrence: RecurrenceDTO,
    month: MonthPeriod,
    payment: RecurrencePaymentDTO | null,
    posted: boolean,
    reference: Date,
  ): ChecklistItemDTO {
    const dueOn = month.dayAt(recurrence.dayOfMonth)
    // Compared at DAY granularity, so a bill due today already counts as taken
    // — that is the day the bank takes it.
    const due = dueOn.getTime() <= Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth(),
      reference.getUTCDate(),
    )

    return {
      recurrenceId: recurrence.id,
      type: recurrence.type,
      categoryId: recurrence.categoryId,
      description: recurrence.description,
      amountCents: payment?.amount ?? recurrence.amount,
      estimatedCents: recurrence.amount,
      variableAmount: recurrence.variableAmount,
      paid: payment?.paidAt != null || (recurrence.autoPaid && due),
      paidAt: payment?.paidAt ?? null,
      autoPaid: recurrence.autoPaid,
      dueOn,
      dayOfMonth: recurrence.dayOfMonth,
      // This month is owed (it is on the list at all) and the NEXT one is not:
      // the deadline lands here, so the line is about to disappear.
      lastMonth:
        recurrence.endsOn !== null &&
        MonthlyChecklistCalculator.endedBefore(recurrence, month.next()),
      bankId: recurrence.bankId,
      cardId: recurrence.cardId,
      paymentMethod: recurrence.paymentMethod,
      posted,
    }
  }
}
