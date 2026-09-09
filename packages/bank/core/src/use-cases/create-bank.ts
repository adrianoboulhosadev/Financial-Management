import { UseCase, ConflictError, Errors } from 'shared'
import { Bank } from '../model'
import { BankRepository } from '../providers'

interface Input {
  ownerId: string
  name: string
  agency?: string | null
  accountNumber?: string | null
}

/** Registers a bank the owner uses. Every rule about the bank itself lives in
 * the entity; the only thing decided here is that one owner does not end up
 * with two banks sharing a name. */
export default class CreateBank implements UseCase<Input, void> {
  constructor(private readonly repository: BankRepository) {}

  async execute({ ownerId, name, agency, accountNumber }: Input): Promise<void> {
    const bank = new Bank({ ownerId, name, agency, accountNumber })

    if (await this.repository.existsByName(ownerId, bank.name)) {
      ConflictError.throwError(Errors.BANK_ALREADY_EXISTS, bank.name)
    }

    await this.repository.create(bank)
  }
}
