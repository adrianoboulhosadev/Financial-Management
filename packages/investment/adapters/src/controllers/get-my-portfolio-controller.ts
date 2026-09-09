import { GetMyPortfolioQuery, InvestmentQueryRepository, PortfolioDTO } from '@investment/core'

export default class GetMyPortfolioController {
  constructor(private readonly queryRepository: InvestmentQueryRepository) {}

  async execute(ownerId: string): Promise<PortfolioDTO> {
    return new GetMyPortfolioQuery(this.queryRepository).execute(ownerId)
  }
}
