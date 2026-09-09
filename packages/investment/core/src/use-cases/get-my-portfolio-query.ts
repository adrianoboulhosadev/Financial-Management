import { UseCase } from 'shared'
import { PortfolioDTO } from '../model'
import { PortfolioCalculator } from '../domain-services'
import { InvestmentQueryRepository } from '../providers'

/**
 * Read side (CQRS): what the caller's portfolio is worth. The arithmetic — and
 * the rules that only active investments count and that a missing current value
 * means "what went in" — belong to the PortfolioCalculator domain service; this
 * use case only wires it to the query.
 */
export default class GetMyPortfolioQuery implements UseCase<string, PortfolioDTO> {
  constructor(private readonly queryRepository: InvestmentQueryRepository) {}

  async execute(ownerId: string): Promise<PortfolioDTO> {
    const investments = await this.queryRepository.listByOwnerQuery(ownerId)
    return PortfolioCalculator.calculate(investments)
  }
}
