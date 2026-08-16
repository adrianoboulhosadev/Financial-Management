import { IncomeSource } from '../model'

/** IncomeSource WRITE port (command side). `existsByName` keeps one owner from
 * ending up with two "Salário" rows they cannot tell apart. */
export interface IncomeSourceRepository {
  findById(id: string): Promise<IncomeSource | null>
  create(source: IncomeSource): Promise<void>
  update(source: IncomeSource): Promise<void>
  delete(id: string): Promise<void>
  existsByName(ownerId: string, name: string): Promise<boolean>
}
