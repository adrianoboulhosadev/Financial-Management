import {
  ListMyRecurrencesQuery,
  RecurrenceQueryRepository,
  RecurrenceDTO,
} from '@transaction/core'

export default class ListMyRecurrencesController {
  constructor(private readonly queryRepository: RecurrenceQueryRepository) {}

  async execute(ownerId: string): Promise<RecurrenceDTO[]> {
    return new ListMyRecurrencesQuery(this.queryRepository).execute(ownerId)
  }
}
