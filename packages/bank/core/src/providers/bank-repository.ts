import { Bank } from '../model'

/**
 * Bank WRITE port (command side). `existsByName` keeps one owner from ending
 * up with two "Itaú" rows they cannot tell apart; `hasCards` guards deletion,
 * the same shape the category tree uses for its children.
 */
export interface BankRepository {
  findById(id: string): Promise<Bank | null>
  create(bank: Bank): Promise<void>
  update(bank: Bank): Promise<void>
  delete(id: string): Promise<void>
  existsByName(ownerId: string, name: string): Promise<boolean>
  hasCards(id: string): Promise<boolean>
}
