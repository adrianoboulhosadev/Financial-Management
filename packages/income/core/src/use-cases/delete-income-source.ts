import { UseCase, NotFoundError, Errors } from 'shared'
import { IncomeSourceRepository } from '../providers'

interface Input {
  ownerId: string
  incomeSourceId: string
}

/** Removes a source for good. Deactivating is usually the better move — this is
 * for a row that should never have existed. */
export default class DeleteIncomeSource implements UseCase<Input, void> {
  constructor(private readonly repository: IncomeSourceRepository) {}

  async execute({ ownerId, incomeSourceId }: Input): Promise<void> {
    const source = await this.repository.findById(incomeSourceId)
    if (!source || !source.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.INCOME_SOURCE_NOT_FOUND, incomeSourceId)
    }

    await this.repository.delete(incomeSourceId)
  }
}
