import {
  BankRepository,
  BankQueryRepository,
  CardRepository,
  CardQueryRepository,
  BankDTO,
  CardDTO,
} from '@bank/core'
import {
  CreateBankController,
  UpdateBankController,
  DeleteBankController,
  ListMyBanksController,
  FindMyBankController,
  CreateCardController,
  UpdateCardController,
  DeleteCardController,
  ListMyCardsController,
  FindMyCardController,
} from '../controllers'
import { CreateBankInput, UpdateBankInput, CreateCardInput, UpdateCardInput } from '../@types'

/**
 * Single entry point the backend (NestJS) calls. Optional ports in the
 * constructor; each method builds its controller. `ownerId` is always the
 * authenticated id resolved from the JWT — a bank and its cards are private to
 * their owner.
 */
export default class BankFacade {
  constructor(
    private readonly bankRepository?: BankRepository,
    private readonly bankQueryRepository?: BankQueryRepository,
    private readonly cardRepository?: CardRepository,
    private readonly cardQueryRepository?: CardQueryRepository,
  ) {}

  async createBank(input: CreateBankInput, ownerId: string): Promise<void> {
    await new CreateBankController(this.bankRepository!).execute(input, ownerId)
  }

  async updateBank(bankId: string, input: UpdateBankInput, ownerId: string): Promise<void> {
    await new UpdateBankController(this.bankRepository!).execute(bankId, input, ownerId)
  }

  async deleteBank(bankId: string, ownerId: string, inUse: boolean): Promise<void> {
    await new DeleteBankController(this.bankRepository!).execute(bankId, ownerId, inUse)
  }

  async listMyBanks(ownerId: string): Promise<BankDTO[]> {
    return new ListMyBanksController(this.bankQueryRepository!).execute(ownerId)
  }

  async findMyBank(bankId: string, ownerId: string): Promise<BankDTO> {
    return new FindMyBankController(this.bankQueryRepository!).execute(bankId, ownerId)
  }

  async createCard(input: CreateCardInput, ownerId: string): Promise<void> {
    await new CreateCardController(this.cardRepository!, this.bankRepository!).execute(
      input,
      ownerId,
    )
  }

  async updateCard(cardId: string, input: UpdateCardInput, ownerId: string): Promise<void> {
    await new UpdateCardController(this.cardRepository!).execute(cardId, input, ownerId)
  }

  async deleteCard(cardId: string, ownerId: string, inUse: boolean): Promise<void> {
    await new DeleteCardController(this.cardRepository!).execute(cardId, ownerId, inUse)
  }

  async listMyCards(ownerId: string): Promise<CardDTO[]> {
    return new ListMyCardsController(this.cardQueryRepository!).execute(ownerId)
  }

  async findMyCard(cardId: string, ownerId: string): Promise<CardDTO> {
    return new FindMyCardController(this.cardQueryRepository!).execute(cardId, ownerId)
  }
}
