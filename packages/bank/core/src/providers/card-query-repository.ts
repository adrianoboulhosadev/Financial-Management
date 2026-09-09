import { CardDTO } from '../model'

/** Card READ port. `listByOwnerQuery` returns every card of the caller across
 * all their banks — the picker groups them by bank on the client, which already
 * holds the bank list. */
export interface CardQueryRepository {
  listByOwnerQuery(ownerId: string): Promise<CardDTO[]>
  findByIdQuery(id: string): Promise<CardDTO | null>
}
