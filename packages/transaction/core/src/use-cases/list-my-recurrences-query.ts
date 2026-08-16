import { UseCase } from 'shared'
import { RecurrenceDTO } from '../model'
import { RecurrenceQueryRepository } from '../providers'

/** Read side (CQRS): the caller's fixed monthly movements. */
export default class ListMyRecurrencesQuery implements UseCase<string, RecurrenceDTO[]> {
  constructor(private readonly queryRepository: RecurrenceQueryRepository) {}

  async execute(ownerId: string): Promise<RecurrenceDTO[]> {
    return this.queryRepository.listByOwnerQuery(ownerId)
  }
}
