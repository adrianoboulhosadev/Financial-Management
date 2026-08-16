import { Injectable } from '@nestjs/common'
import {
  IncomeSourceRepository,
  IncomeSourceQueryRepository,
  IncomeSource,
  IncomeSourceDTO,
} from '@income/adapters'
import { PrismaService } from '../db/prisma.service'

interface IncomeSourceRow {
  id: string
  ownerId: string
  name: string
  amount: number
  payday: number
  active: boolean
}

@Injectable()
export class PrismaIncomeSourceRepository
  implements IncomeSourceRepository, IncomeSourceQueryRepository
{
  constructor(private readonly prisma: PrismaService) {}

  private reconstitute(row: IncomeSourceRow): IncomeSource {
    return new IncomeSource({
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      amount: row.amount,
      payday: row.payday,
      active: row.active,
    })
  }

  async findById(id: string): Promise<IncomeSource | null> {
    const row = await this.prisma.incomeSource.findUnique({ where: { id } })
    return row ? this.reconstitute(row) : null
  }

  async create(source: IncomeSource): Promise<void> {
    await this.prisma.incomeSource.create({
      data: {
        id: source.id.value,
        ownerId: source.ownerId,
        name: source.name,
        amount: source.amount.cents,
        payday: source.payday,
        active: source.active,
      },
    })
  }

  async update(source: IncomeSource): Promise<void> {
    await this.prisma.incomeSource.update({
      where: { id: source.id.value },
      data: {
        name: source.name,
        amount: source.amount.cents,
        payday: source.payday,
        active: source.active,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.incomeSource.delete({ where: { id } })
  }

  async existsByName(ownerId: string, name: string): Promise<boolean> {
    const found = await this.prisma.incomeSource.findUnique({
      where: { ownerId_name: { ownerId, name } },
      select: { id: true },
    })
    return found !== null
  }

  // Returns the inactive ones too: filtering them out of the monthly total is
  // the domain service's rule, not the database's.
  async listByOwnerQuery(ownerId: string): Promise<IncomeSourceDTO[]> {
    return this.prisma.incomeSource.findMany({
      where: { ownerId },
      select: { id: true, ownerId: true, name: true, amount: true, payday: true, active: true },
      orderBy: [{ active: 'desc' }, { payday: 'asc' }],
    })
  }
}
