import { Bank, BankDTO, BankRepository, BankQueryRepository } from '../../src'
import CardRepositoryInMemory from './card-repository-in-memory'

interface BankRow {
  id: string
  ownerId: string
  name: string
  agency: string | null
  accountNumber: string | null
}

/** Shares the card fake so `hasCards` answers off the same data the tests
 * write — the same join the Prisma adapter gets for free. */
export default class BankRepositoryInMemory implements BankRepository, BankQueryRepository {
  readonly banks: BankRow[] = []

  constructor(private readonly cards = new CardRepositoryInMemory()) {}

  get cardRepository(): CardRepositoryInMemory {
    return this.cards
  }

  async findById(id: string): Promise<Bank | null> {
    const row = this.banks.find((bank) => bank.id === id)
    return row ? new Bank(row) : null
  }

  async create(bank: Bank): Promise<void> {
    this.banks.push(this.toRow(bank))
  }

  async update(bank: Bank): Promise<void> {
    const index = this.banks.findIndex((current) => current.id === bank.id.value)
    if (index >= 0) this.banks[index] = this.toRow(bank)
  }

  async delete(id: string): Promise<void> {
    const index = this.banks.findIndex((bank) => bank.id === id)
    if (index >= 0) this.banks.splice(index, 1)
  }

  async existsByName(ownerId: string, name: string): Promise<boolean> {
    return this.banks.some((bank) => bank.ownerId === ownerId && bank.name === name)
  }

  async hasCards(id: string): Promise<boolean> {
    return this.cards.cards.some((card) => card.bankId === id)
  }

  async listByOwnerQuery(ownerId: string): Promise<BankDTO[]> {
    return this.banks.filter((bank) => bank.ownerId === ownerId).map((row) => this.toDTO(row))
  }

  async findByIdQuery(id: string): Promise<BankDTO | null> {
    const row = this.banks.find((bank) => bank.id === id)
    return row ? this.toDTO(row) : null
  }

  private toDTO(row: BankRow): BankDTO {
    return { ...row, cardCount: this.cards.cards.filter((card) => card.bankId === row.id).length }
  }

  private toRow(bank: Bank): BankRow {
    return {
      id: bank.id.value,
      ownerId: bank.ownerId,
      name: bank.name,
      agency: bank.agency,
      accountNumber: bank.accountNumber,
    }
  }
}
