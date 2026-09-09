import { UseCase } from 'shared'
import { CardDTO } from '../model'
import { CardQueryRepository } from '../providers'

/** Read side (CQRS): every card of the caller, across all their banks. */
export default class ListMyCardsQuery implements UseCase<string, CardDTO[]> {
  constructor(private readonly queryRepository: CardQueryRepository) {}

  async execute(ownerId: string): Promise<CardDTO[]> {
    return this.queryRepository.listByOwnerQuery(ownerId)
  }
}
