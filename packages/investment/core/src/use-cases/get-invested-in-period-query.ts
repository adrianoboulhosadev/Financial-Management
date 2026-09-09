import { UseCase, MonthPeriod } from 'shared'
import { InvestmentContributionQueryRepository } from '../providers'

interface Input {
  ownerId: string
  // YYYY-MM.
  period: string
}

/**
 * Read side (CQRS): how much the owner put into investments in a month, in
 * cents. One aggregate rather than the month's rows — this is what the monthly
 * report subtracts from the leftover, so it stays deliberately cheap.
 */
export default class GetInvestedInPeriodQuery implements UseCase<Input, number> {
  constructor(private readonly queryRepository: InvestmentContributionQueryRepository) {}

  async execute({ ownerId, period }: Input): Promise<number> {
    const month = new MonthPeriod(period)
    return this.queryRepository.sumInPeriod(ownerId, month.start, month.end)
  }
}
