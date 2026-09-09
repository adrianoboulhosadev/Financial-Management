import { Card } from '../model'

/**
 * Card WRITE port (command side). The clash to prevent is the SAME card
 * registered twice: inside one bank, the last four digits are what tell two
 * cards apart, so that is what `existsByDigits` asks about.
 */
export interface CardRepository {
  findById(id: string): Promise<Card | null>
  create(card: Card): Promise<void>
  update(card: Card): Promise<void>
  delete(id: string): Promise<void>
  existsByDigits(ownerId: string, bankId: string, lastFourDigits: string): Promise<boolean>
}
