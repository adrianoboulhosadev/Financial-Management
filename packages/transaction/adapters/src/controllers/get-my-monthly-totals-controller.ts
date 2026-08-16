import {
  GetMyMonthlyTotalsQuery,
  TransactionQueryRepository,
  MonthlyTotalsDTO,
} from '@transaction/core'

export default class GetMyMonthlyTotalsController {
  constructor(private readonly queryRepository: TransactionQueryRepository) {}

  async execute(ownerId: string, period: string): Promise<MonthlyTotalsDTO> {
    return new GetMyMonthlyTotalsQuery(this.queryRepository).execute({ ownerId, period })
  }
}
