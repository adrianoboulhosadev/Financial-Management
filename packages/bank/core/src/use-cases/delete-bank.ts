import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { BankRepository } from '../providers'

interface Input {
  ownerId: string
  bankId: string
  /**
   * Whether any movement/recurrence/investment still points at this bank.
   * Resolved by the APP layer (the only one allowed to look at another
   * context) and handed in as plain data — `bank` never imports `transaction`,
   * the same shape the category tree uses for its own in-use check.
   */
  inUse: boolean
}

/**
 * Deletes a bank of the caller's. Refused while it still holds cards (delete
 * those first) or while something already references it — money that moved must
 * never lose the name of where it went.
 */
export default class DeleteBank implements UseCase<Input, void> {
  constructor(private readonly repository: BankRepository) {}

  async execute({ ownerId, bankId, inUse }: Input): Promise<void> {
    const bank = await this.repository.findById(bankId)
    if (!bank || !bank.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.BANK_NOT_FOUND, bankId)
    }

    if (await this.repository.hasCards(bankId)) {
      ConflictError.throwError(Errors.BANK_IN_USE, bankId)
    }
    if (inUse) ConflictError.throwError(Errors.BANK_IN_USE, bankId)

    await this.repository.delete(bankId)
  }
}
