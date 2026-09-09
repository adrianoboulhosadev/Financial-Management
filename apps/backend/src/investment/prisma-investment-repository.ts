import { Injectable } from '@nestjs/common'
import {
  Investment,
  InvestmentDTO,
  InvestmentKind,
  InvestmentRepository,
  InvestmentQueryRepository,
} from '@investment/adapters'
import { PrismaService } from '../db/prisma.service'

interface InvestmentRow {
  id: string
  ownerId: string
  bankId: string | null
  name: string
  kind: string
  investedAmount: number
  currentAmount: number | null
  startedOn: Date
  maturityOn: Date | null
  notes: string | null
  active: boolean
}

@Injectable()
export class PrismaInvestmentRepository
  implements InvestmentRepository, InvestmentQueryRepository
{
  constructor(private readonly prisma: PrismaService) {}

  private reconstitute(row: InvestmentRow): Investment {
    return new Investment({
      id: row.id,
      ownerId: row.ownerId,
      bankId: row.bankId,
      name: row.name,
      kind: row.kind,
      investedAmount: row.investedAmount,
      currentAmount: row.currentAmount,
      startedOn: row.startedOn,
      maturityOn: row.maturityOn,
      notes: row.notes,
      active: row.active,
    })
  }

  async findById(id: string): Promise<Investment | null> {
    const row = await this.prisma.investment.findUnique({ where: { id } })
    return row ? this.reconstitute(row) : null
  }

  async create(investment: Investment): Promise<void> {
    await this.prisma.investment.create({ data: this.dataOf(investment) })
  }

  async update(investment: Investment): Promise<void> {
    const { id: _id, ownerId: _ownerId, ...data } = this.dataOf(investment)
    await this.prisma.investment.update({ where: { id: investment.id.value }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.investment.delete({ where: { id } })
  }

  async existsByName(ownerId: string, name: string): Promise<boolean> {
    const found = await this.prisma.investment.findFirst({
      where: { ownerId, name },
      select: { id: true },
    })
    return found !== null
  }

  async existsByBank(bankId: string): Promise<boolean> {
    const found = await this.prisma.investment.findFirst({ where: { bankId }, select: { id: true } })
    return found !== null
  }

  async listByOwnerQuery(ownerId: string): Promise<InvestmentDTO[]> {
    const rows = await this.prisma.investment.findMany({
      where: { ownerId },
      // Newest application first; the name breaks the tie so two applied on the
      // same day never swap places between two reads.
      orderBy: [{ startedOn: 'desc' }, { name: 'asc' }],
    })
    return rows.map((row) => ({ ...row, kind: row.kind as InvestmentKind }))
  }

  private dataOf(investment: Investment) {
    return {
      id: investment.id.value,
      ownerId: investment.ownerId,
      bankId: investment.bankId,
      name: investment.name,
      kind: investment.kind,
      // Reads the cents off the value objects — the columns are Ints.
      investedAmount: investment.investedAmount.cents,
      currentAmount: investment.currentAmount?.cents ?? null,
      startedOn: investment.startedOn,
      maturityOn: investment.maturityOn,
      notes: investment.notes,
      active: investment.active,
    }
  }
}
