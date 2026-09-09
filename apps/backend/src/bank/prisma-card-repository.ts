import { Injectable } from '@nestjs/common'
import { Card, CardDTO, CardKind, CardRepository, CardQueryRepository } from '@bank/adapters'
import { PrismaService } from '../db/prisma.service'

interface CardRow {
  id: string
  ownerId: string
  bankId: string
  name: string
  kind: string
  lastFourDigits: string
}

@Injectable()
export class PrismaCardRepository implements CardRepository, CardQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private reconstitute(row: CardRow): Card {
    return new Card({
      id: row.id,
      ownerId: row.ownerId,
      bankId: row.bankId,
      name: row.name,
      kind: row.kind,
      lastFourDigits: row.lastFourDigits,
    })
  }

  async findById(id: string): Promise<Card | null> {
    const row = await this.prisma.card.findUnique({ where: { id } })
    return row ? this.reconstitute(row) : null
  }

  async create(card: Card): Promise<void> {
    await this.prisma.card.create({
      data: {
        id: card.id.value,
        ownerId: card.ownerId,
        bankId: card.bankId,
        name: card.name,
        kind: card.kind,
        lastFourDigits: card.lastFourDigits,
      },
    })
  }

  async update(card: Card): Promise<void> {
    await this.prisma.card.update({
      where: { id: card.id.value },
      data: { name: card.name, kind: card.kind, lastFourDigits: card.lastFourDigits },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.card.delete({ where: { id } })
  }

  async existsByName(ownerId: string, bankId: string, name: string): Promise<boolean> {
    const found = await this.prisma.card.findFirst({
      where: { ownerId, bankId, name },
      select: { id: true },
    })
    return found !== null
  }

  async listByOwnerQuery(ownerId: string): Promise<CardDTO[]> {
    const rows = await this.prisma.card.findMany({
      where: { ownerId },
      orderBy: [{ bankId: 'asc' }, { name: 'asc' }],
    })
    return rows.map((row) => this.toDTO(row))
  }

  async findByIdQuery(id: string): Promise<CardDTO | null> {
    const row = await this.prisma.card.findUnique({ where: { id } })
    return row ? this.toDTO(row) : null
  }

  private toDTO(row: CardRow): CardDTO {
    return { ...row, kind: row.kind as CardKind }
  }
}
