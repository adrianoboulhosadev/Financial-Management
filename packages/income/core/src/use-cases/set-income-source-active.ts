import { UseCase, NotFoundError, Errors } from 'shared'
import { IncomeSourceRepository } from '../providers'

interface Input {
  ownerId: string
  incomeSourceId: string
  active: boolean
}

/** Turns a source on or off. Deactivating drops it out of the monthly total
 * WITHOUT erasing it — the record of what the plan used to be stays. */
export default class SetIncomeSourceActive implements UseCase<Input, void> {
  constructor(private readonly repository: IncomeSourceRepository) {}

  async execute({ ownerId, incomeSourceId, active }: Input): Promise<void> {
    const source = await this.repository.findById(incomeSourceId)
    if (!source || !source.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.INCOME_SOURCE_NOT_FOUND, incomeSourceId)
    }

    if (active) source.activate()
    else source.deactivate()

    await this.repository.update(source)
  }
}
