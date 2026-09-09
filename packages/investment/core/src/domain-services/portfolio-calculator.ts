import { InvestmentDTO, InvestmentKind, PortfolioDTO, PortfolioSliceDTO } from '../model'

/**
 * Pure domain service (no ports, no side effects): folds the owner's
 * investments into what the portfolio screen leads with — how much went in,
 * what it is worth now, what it made, and the same split per kind.
 *
 * It owns two rules, and owning them in ONE place is what keeps the total and
 * the slices from ever disagreeing:
 * - only ACTIVE investments count (a redeemed one stays on the books, out of
 *   the total) — the same rule MonthlyIncomeCalculator applies to a source that
 *   stopped paying;
 * - an investment with no current value is worth what was put into it, never
 *   nothing: an unknown that counted as zero would report a total loss.
 */
export class PortfolioCalculator {
  static calculate(investments: InvestmentDTO[]): PortfolioDTO {
    const active = investments.filter((investment) => investment.active)

    let investedCents = 0
    let valueCents = 0
    const byKind = new Map<InvestmentKind, PortfolioSliceDTO>()

    for (const investment of active) {
      const value = PortfolioCalculator.valueOf(investment)
      investedCents += investment.investedAmount
      valueCents += value

      const slice = byKind.get(investment.kind) ?? {
        kind: investment.kind,
        investedCents: 0,
        valueCents: 0,
        returnCents: 0,
      }
      slice.investedCents += investment.investedAmount
      slice.valueCents += value
      slice.returnCents = slice.valueCents - slice.investedCents
      byKind.set(investment.kind, slice)
    }

    return {
      investedCents,
      valueCents,
      returnCents: valueCents - investedCents,
      byKind: PortfolioCalculator.sortedSlices(byKind),
      // Newest application first, then name, so the list never reshuffles
      // between two reads of the same data.
      investments: [...active].sort((left, right) => {
        const byDate = new Date(right.startedOn).getTime() - new Date(left.startedOn).getTime()
        return byDate !== 0 ? byDate : left.name.localeCompare(right.name)
      }),
    }
  }

  /** What one investment is worth today: the current value once there is one,
   * otherwise what was applied. Mirrors Investment.valueCents — the read model
   * carries plain rows, so the rule is restated here rather than borrowed from
   * an entity the query side never builds. */
  private static valueOf(investment: InvestmentDTO): number {
    return investment.currentAmount ?? investment.investedAmount
  }

  /** Biggest holding first — that is the order the screen wants — with the kind
   * as a tie-break so two equal slices never swap places. */
  private static sortedSlices(byKind: Map<InvestmentKind, PortfolioSliceDTO>): PortfolioSliceDTO[] {
    return [...byKind.values()].sort((left, right) => {
      if (right.valueCents !== left.valueCents) return right.valueCents - left.valueCents
      return left.kind.localeCompare(right.kind)
    })
  }
}
