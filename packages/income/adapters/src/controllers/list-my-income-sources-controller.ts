import { ListMyIncomeSourcesQuery, IncomeSourceQueryRepository, IncomeSourceDTO } from '@income/core'

export default class ListMyIncomeSourcesController {
  constructor(private readonly queryRepository: IncomeSourceQueryRepository) {}

  async execute(ownerId: string): Promise<IncomeSourceDTO[]> {
    return new ListMyIncomeSourcesQuery(this.queryRepository).execute(ownerId)
  }
}
