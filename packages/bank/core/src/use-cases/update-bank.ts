import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { BankRepository } from '../providers'

interface Input {
  ownerId: string
  bankId: string
  name?: string
  agency?: string | null
  accountNumber?: string | null
}

/** Edits a bank of the caller's own. Someone else's answers as missing
 * (anti-IDOR). */
export default class UpdateBank implements UseCase<Input, void> {
  constructor(private readonly repository: BankRepository) {}

  async execute({ ownerId, bankId, name, agency, accountNumber }: Input): Promise<void> {
    const bank = await this.repository.findById(bankId)
    if (!bank || !bank.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.BANK_NOT_FOUND, bankId)
    }

    const renamed = name !== undefined && name.trim() !== bank.name
    bank.edit({ name, agency, accountNumber })

    // Only checked when the name actually changed, so the row never clashes
    // with the copy of itself already stored.
    if (renamed && (await this.repository.existsByName(ownerId, bank.name))) {
      ConflictError.throwError(Errors.BANK_ALREADY_EXISTS, bank.name)
    }

    await this.repository.update(bank)
  }
}
