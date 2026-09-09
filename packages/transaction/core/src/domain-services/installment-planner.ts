import { Money, MonthPeriod } from 'shared'

/** One month of a split purchase: what is charged, when, and which of the N
 * this is. */
export interface InstallmentPlanEntry {
  amountCents: number
  occurredOn: Date
  installmentNumber: number
}

/**
 * Pure domain service (no ports, no side effects): breaks a credit purchase
 * into the months it will actually be charged in.
 *
 * Two rules make the result trustworthy, and they live here so the API, the
 * worker and any future importer split money the same way:
 *
 * - the parts ADD UP to the total. Dividing in cents leaves a remainder, and
 *   the remainder goes to the FIRST instalment — which is what card issuers do,
 *   and which means the leftover is charged now rather than hidden in the last
 *   month;
 * - each month keeps the purchase's DAY, clamped to months that are shorter
 *   (see MonthPeriod.dayAt), so a purchase on the 31st is charged on the 28th
 *   in February instead of rolling into March.
 */
export class InstallmentPlanner {
  static plan(totalCents: number, installments: number, firstOccurredOn: Date): InstallmentPlanEntry[] {
    // Money validates the total (positive, integer cents) before it is split,
    // so a bad amount fails here rather than as N bad rows.
    const total = new Money(totalCents).cents
    const base = Math.floor(total / installments)
    const remainder = total - base * installments
    const dayOfMonth = firstOccurredOn.getUTCDate()
    const firstMonth = MonthPeriod.of(firstOccurredOn)

    const entries: InstallmentPlanEntry[] = []
    let month = firstMonth
    for (let index = 0; index < installments; index += 1) {
      entries.push({
        amountCents: index === 0 ? base + remainder : base,
        occurredOn: month.dayAt(dayOfMonth),
        installmentNumber: index + 1,
      })
      month = month.next()
    }
    return entries
  }
}
