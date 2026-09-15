import { MonthPeriod } from 'shared'
import {
  CardDTO,
  CardInvoiceDTO,
  CardInvoicesDTO,
  CardLimitStatus,
  InvoiceSchedule,
} from '../model'

/** The only thing an invoice needs off a charge — so it folds a read-model row
 * just as well as anything else the app can hand it. */
export interface Chargeable {
  occurredOn: Date
  amountCents: number
}

/**
 * Pure domain service (no ports, no side effects): folds a card's credit
 * charges into the invoices they land on.
 *
 * It answers only what the product can say TRUTHFULLY. That means the OPEN
 * invoice and the ones still ahead of it — an instalment due in March is money
 * already committed, which is exactly why it has to count against the limit
 * before it is ever billed. Invoices already CLOSED are left out on purpose:
 * the product does not record whether an invoice was paid, so showing a closed
 * one would either nag about a bill already settled or state a balance it has
 * no way to know.
 *
 * `usedCents` is therefore what is holding the limit down right now, not what
 * the next bill will be — the open invoice alone is the first line of the list.
 */
export class InvoiceCalculator {
  /** Where "watch out" starts: 80% of the limit. It is the bank context's own
   * number even though a budget ceiling happens to use the same one — they are
   * different decisions about different things, and tying them together would
   * move one every time somebody tuned the other. */
  static readonly WARNING_RATIO = 0.8

  static calculate(
    card: CardDTO,
    charges: Chargeable[],
    reference: Date = new Date(),
  ): CardInvoicesDTO | null {
    const schedule = InvoiceSchedule.optional(card)
    // No calendar, no invoice: there is nothing to close and nothing to date,
    // and a list of charges under a made-up due date would be a lie.
    if (!schedule) return null

    const open = schedule.periodOf(reference)
    const totals = new Map<string, number>([[open.value, 0]])

    for (const charge of charges) {
      const period = schedule.periodOf(charge.occurredOn)
      // A charge belonging to an invoice that already closed is history the
      // product cannot settle — counting it would inflate the open one.
      if (period.isBefore(open)) continue
      totals.set(period.value, (totals.get(period.value) ?? 0) + charge.amountCents)
    }

    const invoices: CardInvoiceDTO[] = [...totals.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([value, amountCents]) => {
        const period = new MonthPeriod(value)
        return {
          period: value,
          closesOn: schedule.closesOn(period),
          dueOn: schedule.dueOn(period),
          amountCents,
          open: period.equals(open),
        }
      })

    const usedCents = invoices.reduce((total, invoice) => total + invoice.amountCents, 0)
    const limitCents = card.limitCents

    return {
      cardId: card.id,
      limitCents,
      usedCents,
      // Can go NEGATIVE, and that is the point: "you are 200 over" is the one
      // thing the owner needs to read, the same way a broken budget reports
      // how far past it went.
      availableCents: limitCents === null ? null : limitCents - usedCents,
      // Rounded to whole percent: it drives a bar, not an accounting figure.
      usagePercentage: limitCents === null ? null : Math.round((usedCents / limitCents) * 100),
      limitStatus: limitCents === null ? null : InvoiceCalculator.statusOf(limitCents, usedCents),
      invoices,
    }
  }

  private static statusOf(limitCents: number, usedCents: number): CardLimitStatus {
    if (usedCents >= limitCents) return 'exceeded'
    if (usedCents >= limitCents * InvoiceCalculator.WARNING_RATIO) return 'warning'
    return 'ok'
  }
}
