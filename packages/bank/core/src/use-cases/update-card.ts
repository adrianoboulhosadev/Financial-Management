import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { CardRepository } from '../providers'

interface Input {
  ownerId: string
  cardId: string
  name?: string
  kind?: string
  lastFourDigits?: string
}

/** Edits a card of the caller's own. The bank it hangs from never changes — a
 * card moved to another bank is another card. */
export default class UpdateCard implements UseCase<Input, void> {
  constructor(private readonly repository: CardRepository) {}

  async execute({ ownerId, cardId, name, kind, lastFourDigits }: Input): Promise<void> {
    const card = await this.repository.findById(cardId)
    if (!card || !card.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.CARD_NOT_FOUND, cardId)
    }

    const renamed = name !== undefined && name.trim() !== card.name
    card.edit({ name, kind, lastFourDigits })

    if (renamed && (await this.repository.existsByName(ownerId, card.bankId, card.name))) {
      ConflictError.throwError(Errors.CARD_ALREADY_EXISTS, card.name)
    }

    await this.repository.update(card)
  }
}
