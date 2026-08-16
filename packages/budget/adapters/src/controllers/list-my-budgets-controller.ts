import { ListMyBudgetsQuery, BudgetQueryRepository, BudgetDTO } from '@budget/core'

export default class ListMyBudgetsController {
  constructor(private readonly queryRepository: BudgetQueryRepository) {}

  async execute(ownerId: string): Promise<BudgetDTO[]> {
    return new ListMyBudgetsQuery(this.queryRepository).execute(ownerId)
  }
}
