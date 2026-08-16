import { UseCase, MonthPeriod } from 'shared'
import { TransactionQueryRepository } from '../providers'

interface Input {
  ownerId: string
  categoryId: string
  // YYYY-MM.
  period: string
}

/**
 * Read side (CQRS): how much one category consumed in a month, in cents. A
 * single aggregate rather than the month's rows — this is what the budget check
 * asks for on every expense, so it stays deliberately cheap.
 *
 * There is no actor: the worker calls it while checking a ceiling on the
 * owner's behalf, and the ownerId comes from the job the backend enqueued.
 */
export default class GetSpentByCategoryQuery implements UseCase<Input, number> {
  constructor(private readonly queryRepository: TransactionQueryRepository) {}

  async execute({ ownerId, categoryId, period }: Input): Promise<number> {
    const month = new MonthPeriod(period)
    return this.queryRepository.sumSpentByCategory(ownerId, categoryId, month.start, month.end)
  }
}
