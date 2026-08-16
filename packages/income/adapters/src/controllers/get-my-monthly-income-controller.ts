import { GetMyMonthlyIncomeQuery, IncomeSourceQueryRepository, MonthlyIncomeDTO } from '@income/core'

export default class GetMyMonthlyIncomeController {
  constructor(private readonly queryRepository: IncomeSourceQueryRepository) {}

  async execute(ownerId: string): Promise<MonthlyIncomeDTO> {
    return new GetMyMonthlyIncomeQuery(this.queryRepository).execute(ownerId)
  }
}
