import { InvestmentDTO } from '../model'

/** Investment READ port (query side of CQRS). Returns every investment, active
 * or not — filtering the redeemed ones out of the total is the domain service's
 * rule, not the database's. */
export interface InvestmentQueryRepository {
  listByOwnerQuery(ownerId: string): Promise<InvestmentDTO[]>
}
