import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { Card } from '../model'
import { BankRepository, CardRepository } from '../providers'

interface Input {
  ownerId: string
  bankId: string
  brand: string
  kind: string
  lastFourDigits: string
}

/**
 * Registers a card under one of the owner's banks. The bank must exist AND
 * belong to the same user — someone else's answers as missing, so the list of
 * banks cannot be probed from the outside. The last four digits are unique
 * inside the bank: registering the same card twice is the only clash there is
 * to prevent.
 */
export default class CreateCard implements UseCase<Input, void> {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly bankRepository: BankRepository,
  ) {}

  async execute({ ownerId, bankId, brand, kind, lastFourDigits }: Input): Promise<void> {
    const bank = await this.bankRepository.findById(bankId)
    if (!bank || !bank.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.BANK_NOT_FOUND, bankId)
    }

    const card = new Card({ ownerId, bankId, brand, kind, lastFourDigits })

    if (await this.cardRepository.existsByDigits(ownerId, bankId, card.lastFourDigits)) {
      ConflictError.throwError(Errors.CARD_ALREADY_EXISTS, card.lastFourDigits)
    }

    await this.cardRepository.create(card)
  }
}
