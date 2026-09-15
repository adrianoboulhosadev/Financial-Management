import { MonthPeriod } from 'shared'
import {
  CardDTO,
  CardInvoiceDTO,
  CardInvoicesDTO,
  CardLimitStatus,
  InvoiceSchedule,
  PayableInvoiceDTO,
} from '../model'
import { CardInvoicePaymentDTO } from '../providers/card-invoice-payment-repository'

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
 * `calculate` answers the CARD's question — what is coming — and deliberately
 * stops at the open invoice: an invoice already closed is one the owner may
 * well have paid, and the card screen has no business nagging about it.
 * `payableIn` answers the MONTH's question — what has to be settled — and there
 * the closed one is exactly the point, because by then the owner's tick says
 * whether it is still owed.
 *
 * An invoice is never an EXPENSE in either answer. Every charge on it was
 * already recorded as a movement on the day it was made, so adding the invoice
 * to a month's spending would count the same money twice.
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
      // A charge belonging to an invoice that already closed is history this
      // answer does not cover — counting it would inflate the open one.
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

  /**
   * The invoice this card owes in `period` — the one line it puts on the
   * month's checklist. Exactly one per card, because closing happens once a
   * month and the due date follows from it.
   *
   * Returns `null` when there is nothing to pay: no calendar, or an invoice
   * that came to zero. A card nobody used has no bill, and listing it at
   * R$ 0,00 would ask the owner to tick off nothing.
   */
  static payableIn(
    card: CardDTO,
    period: MonthPeriod,
    charges: Chargeable[],
    payments: CardInvoicePaymentDTO[] = [],
    reference: Date = new Date(),
  ): PayableInvoiceDTO | null {
    const schedule = InvoiceSchedule.optional(card)
    if (!schedule) return null

    const closing = schedule.closingPeriodDueIn(period)
    const amountCents = charges
      .filter((charge) => schedule.periodOf(charge.occurredOn).equals(closing))
      .reduce((total, charge) => total + charge.amountCents, 0)

    if (amountCents === 0) return null

    const closesOn = schedule.closesOn(closing)
    const paidAt =
      payments.find(
        (payment) => payment.cardId === card.id && payment.period === closing.value,
      )?.paidAt ?? null

    return {
      cardId: card.id,
      period: closing.value,
      closesOn,
      dueOn: schedule.dueOn(closing),
      amountCents,
      closed: reference.getTime() >= closesOn.getTime(),
      paid: paidAt !== null,
      paidAt,
    }
  }

  private static statusOf(limitCents: number, usedCents: number): CardLimitStatus {
    if (usedCents >= limitCents) return 'exceeded'
    if (usedCents >= limitCents * InvoiceCalculator.WARNING_RATIO) return 'warning'
    return 'ok'
  }
}
