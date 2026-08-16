import { UseCase } from 'shared'
import { BudgetDTO } from '../model'
import { BudgetQueryRepository } from '../providers'

/** Read side (CQRS): the caller's ceilings, without any spending attached —
 * see GetMyBudgetUsageQuery for the version that knows how much is left. */
export default class ListMyBudgetsQuery implements UseCase<string, BudgetDTO[]> {
  constructor(private readonly queryRepository: BudgetQueryRepository) {}

  async execute(ownerId: string): Promise<BudgetDTO[]> {
    return this.queryRepository.listByOwnerQuery(ownerId)
  }
}
