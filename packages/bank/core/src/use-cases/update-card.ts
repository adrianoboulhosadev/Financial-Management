import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { CardRepository } from '../providers'

interface Input {
  ownerId: string
  cardId: string
  brand?: string
  kind?: string
  lastFourDigits?: string
}

/** Edits a card of the caller's own. The bank it hangs from never changes — a
 * card moved to another bank is another card. */
export default class UpdateCard implements UseCase<Input, void> {
  constructor(private readonly repository: CardRepository) {}

  async execute({ ownerId, cardId, brand, kind, lastFourDigits }: Input): Promise<void> {
    const card = await this.repository.findById(cardId)
    if (!card || !card.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.CARD_NOT_FOUND, cardId)
    }

    const renumbered = lastFourDigits !== undefined && lastFourDigits.trim() !== card.lastFourDigits
    card.edit({ brand, kind, lastFourDigits })

    // Only checked when the digits actually changed, so the row never clashes
    // with the copy of itself already stored.
    if (renumbered && (await this.repository.existsByDigits(ownerId, card.bankId, card.lastFourDigits))) {
      ConflictError.throwError(Errors.CARD_ALREADY_EXISTS, card.lastFourDigits)
    }

    await this.repository.update(card)
  }
}
