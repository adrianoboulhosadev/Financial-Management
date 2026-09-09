import { ListMyCardsQuery, CardQueryRepository, CardDTO } from '@bank/core'

export default class ListMyCardsController {
  constructor(private readonly queryRepository: CardQueryRepository) {}

  async execute(ownerId: string): Promise<CardDTO[]> {
    return new ListMyCardsQuery(this.queryRepository).execute(ownerId)
  }
}
