import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { IncomeSourceRepository } from '../providers'

interface Input {
  ownerId: string
  incomeSourceId: string
  name?: string
  amount?: number
  payday?: number
}

/** Edits a source of the caller's own — a raise, a new payday. Someone else's
 * answers as missing (anti-IDOR). */
export default class UpdateIncomeSource implements UseCase<Input, void> {
  constructor(private readonly repository: IncomeSourceRepository) {}

  async execute({ ownerId, incomeSourceId, name, amount, payday }: Input): Promise<void> {
    const source = await this.repository.findById(incomeSourceId)
    if (!source || !source.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.INCOME_SOURCE_NOT_FOUND, incomeSourceId)
    }

    const renamed = name !== undefined && name.trim() !== source.name
    source.edit({ name, amount, payday })

    // Only checked when the name actually changed, so the row never clashes
    // with the copy of itself already stored.
    if (renamed && (await this.repository.existsByName(ownerId, source.name))) {
      ConflictError.throwError(Errors.INCOME_SOURCE_ALREADY_EXISTS, source.name)
    }

    await this.repository.update(source)
  }
}
