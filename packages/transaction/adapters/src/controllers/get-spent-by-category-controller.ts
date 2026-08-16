import { GetSpentByCategoryQuery, TransactionQueryRepository } from '@transaction/core'

/** System path: the worker asks this while checking a budget ceiling. */
export default class GetSpentByCategoryController {
  constructor(private readonly queryRepository: TransactionQueryRepository) {}

  async execute(ownerId: string, categoryId: string, period: string): Promise<number> {
    return new GetSpentByCategoryQuery(this.queryRepository).execute({
      ownerId,
      categoryId,
      period,
    })
  }
}
