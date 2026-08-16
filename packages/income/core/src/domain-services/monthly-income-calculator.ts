import { IncomeSourceDTO, MonthlyIncomeDTO } from '../model'

/**
 * Pure domain service (no ports, no side effects): what the owner can count on
 * this month. The rule it owns is small but load-bearing — only ACTIVE sources
 * count — and it lives in one place so the dashboard and the monthly report can
 * never disagree about the number they are subtracting expenses from.
 */
export class MonthlyIncomeCalculator {
  static calculate(sources: IncomeSourceDTO[]): MonthlyIncomeDTO {
    const active = sources
      .filter((source) => source.active)
      // Earliest payday first: that is the order the money actually arrives in.
      .sort((left, right) => left.payday - right.payday)

    return {
      totalCents: active.reduce((total, source) => total + source.amount, 0),
      sources: active,
    }
  }
}
