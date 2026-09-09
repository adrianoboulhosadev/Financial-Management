import { Investment } from '../model'

/** Investment WRITE port (command side). `existsByName` keeps one owner from
 * ending up with two "Tesouro Selic 2029" rows they cannot tell apart. */
export interface InvestmentRepository {
  findById(id: string): Promise<Investment | null>
  create(investment: Investment): Promise<void>
  update(investment: Investment): Promise<void>
  delete(id: string): Promise<void>
  existsByName(ownerId: string, name: string): Promise<boolean>
  /** Whether any investment still points at a given bank — the answer the app
   * layer needs before letting that bank be deleted. */
  existsByBank(bankId: string): Promise<boolean>
}
