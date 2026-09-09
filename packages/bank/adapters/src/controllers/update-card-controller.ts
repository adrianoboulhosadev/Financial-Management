import { UpdateCard, CardRepository } from '@bank/core'
import { UpdateCardInput } from '../@types'

export default class UpdateCardController {
  constructor(private readonly repository: CardRepository) {}

  async execute(cardId: string, input: UpdateCardInput, ownerId: string): Promise<void> {
    await new UpdateCard(this.repository).execute({ ownerId, cardId, ...input })
  }
}
