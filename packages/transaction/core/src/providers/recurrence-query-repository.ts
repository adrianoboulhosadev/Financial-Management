import { RecurrenceDTO } from '../model'

/** Recurrence READ port (query side of CQRS). */
export interface RecurrenceQueryRepository {
  listByOwnerQuery(ownerId: string): Promise<RecurrenceDTO[]>
  findByIdQuery(id: string): Promise<RecurrenceDTO | null>
}
