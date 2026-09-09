import { UseCase, MonthPeriod } from 'shared'
import { MonthlyTotalsDTO } from '../model'
import { MonthlyTotalsCalculator, MonthlyChecklistCalculator } from '../domain-services'
import { TransactionQueryRepository, RecurrenceQueryRepository } from '../providers'

interface Input {
  ownerId: string
  // YYYY-MM. The MonthPeriod value object validates it and builds the window.
  period: string
}

/**
 * Read side (CQRS): what the given month adds up to. The window comes from the
 * MonthPeriod value object and the arithmetic from the MonthlyTotalsCalculator
 * domain service — this use case only wires the two, which is why the dashboard
 * and the report can never disagree about a total.
 *
 * The recurrence port is OPTIONAL, and what it adds is the month's COMMITMENTS:
 * the fixed bills that have not been posted yet. Without it the totals are
 * purely what moved (which is all the budget check ever wants); with it they
 * also carry what the month still owes, which is what makes "quanto sobra"
 * truthful on the 3rd of the month instead of only on the 31st.
 */
export default class GetMyMonthlyTotalsQuery implements UseCase<Input, MonthlyTotalsDTO> {
  constructor(
    private readonly queryRepository: TransactionQueryRepository,
    private readonly recurrenceQueryRepository?: RecurrenceQueryRepository,
  ) {}

  async execute({ ownerId, period }: Input): Promise<MonthlyTotalsDTO> {
    const month = new MonthPeriod(period)
    const movements = await this.queryRepository.listByOwnerQuery(ownerId, {
      from: month.start,
      to: month.end,
    })

    return MonthlyTotalsCalculator.calculate(
      movements,
      await this.commitmentsOf(ownerId, month),
    )
  }

  private async commitmentsOf(ownerId: string, month: MonthPeriod) {
    if (!this.recurrenceQueryRepository) return []

    const [recurrences, payments, posted] = await Promise.all([
      this.recurrenceQueryRepository.listByOwnerQuery(ownerId),
      this.recurrenceQueryRepository.listPaymentsQuery(ownerId, month.value),
      this.recurrenceQueryRepository.listPostedRecurrenceIds(ownerId, month.start, month.end),
    ])

    const checklist = MonthlyChecklistCalculator.calculate(
      month.value,
      recurrences,
      payments,
      posted,
    )
    // A month already over commits to nothing — that rule lives in the
    // calculator, next to the one that built the checklist.
    return MonthlyChecklistCalculator.commitmentsOf(checklist)
  }
}
