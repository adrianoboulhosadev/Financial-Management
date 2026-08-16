import {
  IncomeSource,
  IncomeSourceDTO,
  IncomeSourceRepository,
  IncomeSourceQueryRepository,
} from '../../src'

interface IncomeSourceRow {
  id: string
  ownerId: string
  name: string
  amount: number
  payday: number
  active: boolean
}

export default class IncomeSourceRepositoryInMemory
  implements IncomeSourceRepository, IncomeSourceQueryRepository
{
  readonly sources: IncomeSourceRow[] = []

  async findById(id: string): Promise<IncomeSource | null> {
    const row = this.sources.find((source) => source.id === id)
    return row ? new IncomeSource(row) : null
  }

  async create(source: IncomeSource): Promise<void> {
    this.sources.push(this.toRow(source))
  }

  async update(source: IncomeSource): Promise<void> {
    const index = this.sources.findIndex((current) => current.id === source.id.value)
    if (index >= 0) this.sources[index] = this.toRow(source)
  }

  async delete(id: string): Promise<void> {
    const index = this.sources.findIndex((source) => source.id === id)
    if (index >= 0) this.sources.splice(index, 1)
  }

  async existsByName(ownerId: string, name: string): Promise<boolean> {
    return this.sources.some((source) => source.ownerId === ownerId && source.name === name)
  }

  async listByOwnerQuery(ownerId: string): Promise<IncomeSourceDTO[]> {
    return this.sources.filter((source) => source.ownerId === ownerId).map((row) => ({ ...row }))
  }

  private toRow(source: IncomeSource): IncomeSourceRow {
    return {
      id: source.id.value,
      ownerId: source.ownerId,
      name: source.name,
      amount: source.amount.cents,
      payday: source.payday,
      active: source.active,
    }
  }
}
