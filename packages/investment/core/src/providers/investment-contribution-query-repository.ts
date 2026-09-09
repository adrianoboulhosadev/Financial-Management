/** Contribution READ port. The month only ever asks for the TOTAL — how much of
 * its leftover was already put to work — so the port answers one number instead
 * of dragging every row back to add them up. The window is [from, to), the same
 * shape MonthPeriod builds. */
export interface InvestmentContributionQueryRepository {
  sumInPeriod(ownerId: string, from: Date, to: Date): Promise<number>
}
