import {
  Card,
  CardDTO,
  CardBrand,
  CardKind,
  CardRepository,
  CardQueryRepository,
} from '../../src'

interface CardRow {
  id: string
  ownerId: string
  bankId: string
  brand: CardBrand
  kind: CardKind
  lastFourDigits: string
}

export default class CardRepositoryInMemory implements CardRepository, CardQueryRepository {
  readonly cards: CardRow[] = []

  async findById(id: string): Promise<Card | null> {
    const row = this.cards.find((card) => card.id === id)
    return row ? new Card(row) : null
  }

  async create(card: Card): Promise<void> {
    this.cards.push(this.toRow(card))
  }

  async update(card: Card): Promise<void> {
    const index = this.cards.findIndex((current) => current.id === card.id.value)
    if (index >= 0) this.cards[index] = this.toRow(card)
  }

  async delete(id: string): Promise<void> {
    const index = this.cards.findIndex((card) => card.id === id)
    if (index >= 0) this.cards.splice(index, 1)
  }

  async existsByDigits(
    ownerId: string,
    bankId: string,
    lastFourDigits: string,
  ): Promise<boolean> {
    return this.cards.some(
      (card) =>
        card.ownerId === ownerId &&
        card.bankId === bankId &&
        card.lastFourDigits === lastFourDigits,
    )
  }

  async listByOwnerQuery(ownerId: string): Promise<CardDTO[]> {
    return this.cards.filter((card) => card.ownerId === ownerId).map((row) => ({ ...row }))
  }

  async findByIdQuery(id: string): Promise<CardDTO | null> {
    const row = this.cards.find((card) => card.id === id)
    return row ? { ...row } : null
  }

  private toRow(card: Card): CardRow {
    return {
      id: card.id.value,
      ownerId: card.ownerId,
      bankId: card.bankId,
      brand: card.brand,
      kind: card.kind,
      lastFourDigits: card.lastFourDigits,
    }
  }
}
