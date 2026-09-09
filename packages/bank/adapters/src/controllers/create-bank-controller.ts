import { CreateBank, BankRepository } from '@bank/core'
import { CreateBankInput } from '../@types'

export default class CreateBankController {
  constructor(private readonly repository: BankRepository) {}

  // ownerId comes from the JWT (HTTP boundary), never from the request body.
  async execute(input: CreateBankInput, ownerId: string): Promise<void> {
    await new CreateBank(this.repository).execute({ ownerId, ...input })
  }
}
