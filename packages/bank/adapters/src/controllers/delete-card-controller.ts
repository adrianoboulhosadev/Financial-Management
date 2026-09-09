import { DeleteCard, CardRepository } from '@bank/core'

export default class DeleteCardController {
  constructor(private readonly repository: CardRepository) {}

  async execute(cardId: string, ownerId: string, inUse: boolean): Promise<void> {
    await new DeleteCard(this.repository).execute({ ownerId, cardId, inUse })
  }
}
