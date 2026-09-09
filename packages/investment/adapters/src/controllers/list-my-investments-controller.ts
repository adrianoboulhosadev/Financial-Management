import { ListMyInvestmentsQuery, InvestmentQueryRepository, InvestmentDTO } from '@investment/core'

export default class ListMyInvestmentsController {
  constructor(private readonly queryRepository: InvestmentQueryRepository) {}

  async execute(ownerId: string): Promise<InvestmentDTO[]> {
    return new ListMyInvestmentsQuery(this.queryRepository).execute(ownerId)
  }
}
