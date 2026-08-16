import { UseCase } from 'shared'
import { MonthlyIncomeDTO } from '../model'
import { MonthlyIncomeCalculator } from '../domain-services'
import { IncomeSourceQueryRepository } from '../providers'

/**
 * Read side (CQRS): what the caller can count on this month. The rule that only
 * ACTIVE sources count belongs to the MonthlyIncomeCalculator domain service —
 * this use case only wires it to the query.
 */
export default class GetMyMonthlyIncomeQuery implements UseCase<string, MonthlyIncomeDTO> {
  constructor(private readonly queryRepository: IncomeSourceQueryRepository) {}

  async execute(ownerId: string): Promise<MonthlyIncomeDTO> {
    const sources = await this.queryRepository.listByOwnerQuery(ownerId)
    return MonthlyIncomeCalculator.calculate(sources)
  }
}
