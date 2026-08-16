import { IncomeSourceDTO } from '../model'

/** IncomeSource READ port (query side of CQRS). Returns every source, active or
 * not — filtering the inactive ones out of the total is the domain service's
 * rule, not the database's. */
export interface IncomeSourceQueryRepository {
  listByOwnerQuery(ownerId: string): Promise<IncomeSourceDTO[]>
}
