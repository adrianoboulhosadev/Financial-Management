import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { CardRepository } from '../providers'

interface Input {
  ownerId: string
  cardId: string
  /** Whether any movement/recurrence still points at this card — resolved by
   * the APP layer and handed in as plain data, same as the bank's. */
  inUse: boolean
}

/** Deletes a card of the caller's. Refused while something already references
 * it: a paid instalment must not lose the card it was charged to. */
export default class DeleteCard implements UseCase<Input, void> {
  constructor(private readonly repository: CardRepository) {}

  async execute({ ownerId, cardId, inUse }: Input): Promise<void> {
    const card = await this.repository.findById(cardId)
    if (!card || !card.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.CARD_NOT_FOUND, cardId)
    }

    if (inUse) ConflictError.throwError(Errors.CARD_IN_USE, cardId)

    await this.repository.delete(cardId)
  }
}
