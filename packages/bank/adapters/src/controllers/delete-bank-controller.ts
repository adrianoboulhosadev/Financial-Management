import { DeleteBank, BankRepository } from '@bank/core'

export default class DeleteBankController {
  constructor(private readonly repository: BankRepository) {}

  // `inUse` is resolved by the app layer (it is the one allowed to look at the
  // other contexts) and travels in as plain data.
  async execute(bankId: string, ownerId: string, inUse: boolean): Promise<void> {
    await new DeleteBank(this.repository).execute({ ownerId, bankId, inUse })
  }
}
