import { Card } from '../model'

/** Card WRITE port (command side). Names are unique per (owner, bank): two
 * banks may each have a "Black", and inside one bank they would be
 * indistinguishable. */
export interface CardRepository {
  findById(id: string): Promise<Card | null>
  create(card: Card): Promise<void>
  update(card: Card): Promise<void>
  delete(id: string): Promise<void>
  existsByName(ownerId: string, bankId: string, name: string): Promise<boolean>
}
