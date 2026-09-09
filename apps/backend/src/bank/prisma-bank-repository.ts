import { Injectable } from '@nestjs/common'
import { Bank, BankDTO, BankRepository, BankQueryRepository } from '@bank/adapters'
import { PrismaService } from '../db/prisma.service'

interface BankRow {
  id: string
  ownerId: string
  name: string
  agency: string | null
  accountNumber: string | null
}

@Injectable()
export class PrismaBankRepository implements BankRepository, BankQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private reconstitute(row: BankRow): Bank {
    return new Bank({
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      agency: row.agency,
      accountNumber: row.accountNumber,
    })
  }

  async findById(id: string): Promise<Bank | null> {
    const row = await this.prisma.bank.findUnique({ where: { id } })
    return row ? this.reconstitute(row) : null
  }

  async create(bank: Bank): Promise<void> {
    await this.prisma.bank.create({
      data: {
        id: bank.id.value,
        ownerId: bank.ownerId,
        name: bank.name,
        agency: bank.agency,
        accountNumber: bank.accountNumber,
      },
    })
  }

  async update(bank: Bank): Promise<void> {
    await this.prisma.bank.update({
      where: { id: bank.id.value },
      data: { name: bank.name, agency: bank.agency, accountNumber: bank.accountNumber },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bank.delete({ where: { id } })
  }

  async existsByName(ownerId: string, name: string): Promise<boolean> {
    const found = await this.prisma.bank.findFirst({ where: { ownerId, name }, select: { id: true } })
    return found !== null
  }

  async hasCards(id: string): Promise<boolean> {
    const found = await this.prisma.card.findFirst({ where: { bankId: id }, select: { id: true } })
    return found !== null
  }

  /**
   * Read side (CQRS). `cardCount` is derived, not stored: one query brings the
   * banks with the count alongside, so the screen can say what a bank still
   * holds without a second round trip.
   */
  async listByOwnerQuery(ownerId: string): Promise<BankDTO[]> {
    const rows = await this.prisma.bank.findMany({
      where: { ownerId },
      orderBy: [{ name: 'asc' }],
      include: { _count: { select: { cards: true } } },
    })
    return rows.map((row) => ({
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      agency: row.agency,
      accountNumber: row.accountNumber,
      cardCount: row._count.cards,
    }))
  }

  async findByIdQuery(id: string): Promise<BankDTO | null> {
    const row = await this.prisma.bank.findUnique({
      where: { id },
      include: { _count: { select: { cards: true } } },
    })
    if (!row) return null
    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      agency: row.agency,
      accountNumber: row.accountNumber,
      cardCount: row._count.cards,
    }
  }
}
