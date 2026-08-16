import { UseCase, MonthPeriod } from 'shared'
import { MonthlyTotalsDTO } from '../model'
import { MonthlyTotalsCalculator } from '../domain-services'
import { TransactionQueryRepository } from '../providers'

interface Input {
  ownerId: string
  // YYYY-MM. The MonthPeriod value object validates it and builds the window.
  period: string
}

/**
 * Read side (CQRS): what the given month adds up to. The window comes from the
 * MonthPeriod value object and the arithmetic from the MonthlyTotalsCalculator
 * domain service — this use case only wires the two, which is why the dashboard
 * and the report can never disagree about a total.
 */
export default class GetMyMonthlyTotalsQuery implements UseCase<Input, MonthlyTotalsDTO> {
  constructor(private readonly queryRepository: TransactionQueryRepository) {}

  async execute({ ownerId, period }: Input): Promise<MonthlyTotalsDTO> {
    const month = new MonthPeriod(period)
    const movements = await this.queryRepository.listByOwnerQuery(ownerId, {
      from: month.start,
      to: month.end,
    })
    return MonthlyTotalsCalculator.calculate(movements)
  }
}
