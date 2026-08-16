import { BudgetDTO } from '../model'

/** Budget READ port (query side of CQRS). */
export interface BudgetQueryRepository {
  listByOwnerQuery(ownerId: string): Promise<BudgetDTO[]>
  findByCategoryQuery(ownerId: string, categoryId: string): Promise<BudgetDTO | null>
}
