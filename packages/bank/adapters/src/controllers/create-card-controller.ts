import { CreateCard, CardRepository, BankRepository } from '@bank/core'
import { CreateCardInput } from '../@types'

export default class CreateCardController {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly bankRepository: BankRepository,
  ) {}

  async execute(input: CreateCardInput, ownerId: string): Promise<void> {
    await new CreateCard(this.cardRepository, this.bankRepository).execute({ ownerId, ...input })
  }
}
