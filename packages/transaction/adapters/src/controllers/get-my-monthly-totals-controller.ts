import {
  GetMyMonthlyTotalsQuery,
  TransactionQueryRepository,
  RecurrenceQueryRepository,
  MonthlyTotalsDTO,
} from '@transaction/core'

export default class GetMyMonthlyTotalsController {
  constructor(
    private readonly queryRepository: TransactionQueryRepository,
    // Optional: without it the totals are purely what moved, which is all the
    // budget check ever wants. With it they also carry the month's unpaid
    // fixed bills.
    private readonly recurrenceQueryRepository?: RecurrenceQueryRepository,
  ) {}

  async execute(ownerId: string, period: string): Promise<MonthlyTotalsDTO> {
    return new GetMyMonthlyTotalsQuery(
      this.queryRepository,
      this.recurrenceQueryRepository,
    ).execute({ ownerId, period })
  }
}
