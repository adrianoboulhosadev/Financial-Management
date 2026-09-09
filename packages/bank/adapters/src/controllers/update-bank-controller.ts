import { UpdateBank, BankRepository } from '@bank/core'
import { UpdateBankInput } from '../@types'

export default class UpdateBankController {
  constructor(private readonly repository: BankRepository) {}

  async execute(bankId: string, input: UpdateBankInput, ownerId: string): Promise<void> {
    await new UpdateBank(this.repository).execute({ ownerId, bankId, ...input })
  }
}
