import { UseCase, NotFoundError, Errors } from 'shared'
import { BankDTO } from '../model'
import { BankQueryRepository } from '../providers'

interface Input {
  ownerId: string
  bankId: string
}

/**
 * Read side (CQRS) of a single bank. This is what the APP layer calls to
 * resolve "does this bank exist and is it mine?" before letting a movement
 * point at it — someone else's is indistinguishable from a missing one.
 */
export default class FindMyBankQuery implements UseCase<Input, BankDTO> {
  constructor(private readonly queryRepository: BankQueryRepository) {}

  async execute({ ownerId, bankId }: Input): Promise<BankDTO> {
    const bank = await this.queryRepository.findByIdQuery(bankId)
    if (!bank || bank.ownerId !== ownerId) {
      NotFoundError.throwError(Errors.BANK_NOT_FOUND, bankId)
    }
    return bank
  }
}
