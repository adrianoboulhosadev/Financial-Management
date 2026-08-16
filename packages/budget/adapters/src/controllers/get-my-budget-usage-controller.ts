import {
  GetMyBudgetUsageQuery,
  BudgetQueryRepository,
  BudgetUsageDTO,
  CategorySpent,
} from '@budget/core'

export default class GetMyBudgetUsageController {
  constructor(private readonly queryRepository: BudgetQueryRepository) {}

  // `spending` comes from the app layer, which resolved it in the transaction context.
  async execute(ownerId: string, spending: CategorySpent[]): Promise<BudgetUsageDTO[]> {
    return new GetMyBudgetUsageQuery(this.queryRepository).execute({ ownerId, spending })
  }
}
