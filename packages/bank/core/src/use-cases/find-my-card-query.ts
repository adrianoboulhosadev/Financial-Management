import { UseCase, NotFoundError, Errors } from 'shared'
import { CardDTO } from '../model'
import { CardQueryRepository } from '../providers'

interface Input {
  ownerId: string
  cardId: string
}

/** Read side (CQRS) of a single card — what the APP layer calls before letting
 * a movement point at it. Someone else's answers as missing (anti-IDOR). */
export default class FindMyCardQuery implements UseCase<Input, CardDTO> {
  constructor(private readonly queryRepository: CardQueryRepository) {}

  async execute({ ownerId, cardId }: Input): Promise<CardDTO> {
    const card = await this.queryRepository.findByIdQuery(cardId)
    if (!card || card.ownerId !== ownerId) {
      NotFoundError.throwError(Errors.CARD_NOT_FOUND, cardId)
    }
    return card
  }
}
