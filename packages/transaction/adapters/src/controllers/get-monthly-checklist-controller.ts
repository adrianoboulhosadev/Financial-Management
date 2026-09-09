import {
  GetMonthlyChecklistQuery,
  RecurrenceQueryRepository,
  MonthlyChecklistDTO,
} from '@transaction/core'

export default class GetMonthlyChecklistController {
  constructor(private readonly queryRepository: RecurrenceQueryRepository) {}

  async execute(ownerId: string, period: string): Promise<MonthlyChecklistDTO> {
    return new GetMonthlyChecklistQuery(this.queryRepository).execute({ ownerId, period })
  }
}
