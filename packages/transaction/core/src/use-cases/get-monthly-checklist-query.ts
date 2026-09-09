import { UseCase, MonthPeriod } from 'shared'
import { MonthlyChecklistDTO } from '../model'
import { MonthlyChecklistCalculator } from '../domain-services'
import { RecurrenceQueryRepository } from '../providers'

interface Input {
  ownerId: string
  // YYYY-MM.
  period: string
}

/**
 * Read side (CQRS): the month's to-do list of fixed bills. Three cheap reads —
 * the recurrences, the deviations recorded for the month, and which of them the
 * worker already posted — folded by the MonthlyChecklistCalculator domain
 * service, which is where "what does this month cost" and "what counts as paid"
 * are decided.
 */
export default class GetMonthlyChecklistQuery implements UseCase<Input, MonthlyChecklistDTO> {
  constructor(private readonly queryRepository: RecurrenceQueryRepository) {}

  async execute({ ownerId, period }: Input): Promise<MonthlyChecklistDTO> {
    const month = new MonthPeriod(period)
    const [recurrences, payments, posted] = await Promise.all([
      this.queryRepository.listByOwnerQuery(ownerId),
      this.queryRepository.listPaymentsQuery(ownerId, month.value),
      this.queryRepository.listPostedRecurrenceIds(ownerId, month.start, month.end),
    ])

    return MonthlyChecklistCalculator.calculate(month.value, recurrences, payments, posted)
  }
}
