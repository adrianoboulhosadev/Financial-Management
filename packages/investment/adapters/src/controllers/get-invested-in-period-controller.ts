import {
  GetInvestedInPeriodQuery,
  InvestmentContributionQueryRepository,
} from '@investment/core'

export default class GetInvestedInPeriodController {
  constructor(private readonly queryRepository: InvestmentContributionQueryRepository) {}

  async execute(ownerId: string, period: string): Promise<number> {
    return new GetInvestedInPeriodQuery(this.queryRepository).execute({ ownerId, period })
  }
}
