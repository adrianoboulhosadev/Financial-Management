import { FindMyCardQuery, CardQueryRepository, CardDTO } from '@bank/core'

export default class FindMyCardController {
  constructor(private readonly queryRepository: CardQueryRepository) {}

  async execute(cardId: string, ownerId: string): Promise<CardDTO> {
    return new FindMyCardQuery(this.queryRepository).execute({ ownerId, cardId })
  }
}
