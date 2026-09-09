import { BankDTO } from '../model'

/** Bank READ port (query side of CQRS). */
export interface BankQueryRepository {
  listByOwnerQuery(ownerId: string): Promise<BankDTO[]>
  findByIdQuery(id: string): Promise<BankDTO | null>
}
