import {
  BankRepository,
  BankQueryRepository,
  CardRepository,
  CardQueryRepository,
  BankDTO,
  CardDTO,
  CardCharge,
  CardInvoicesDTO,
  CardInvoicePaymentRepository,
  CardInvoicePaymentQueryRepository,
  PayableInvoiceDTO,
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
  ListMyCardInvoicesController,
  ListMyPayableInvoicesController,
  SetInvoicePaidController,
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
    private readonly invoicePaymentRepository?: CardInvoicePaymentRepository &
      CardInvoicePaymentQueryRepository,
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

  /** The charges are handed in by the app, which is the only layer allowed to
   * read them out of the `transaction` context. */
  async listMyCardInvoices(ownerId: string, charges: CardCharge[]): Promise<CardInvoicesDTO[]> {
    return new ListMyCardInvoicesController(this.cardQueryRepository!).execute(ownerId, charges)
  }

  /** The invoices the given month has to settle. */
  async listMyPayableInvoices(
    ownerId: string,
    period: string,
    charges: CardCharge[],
  ): Promise<PayableInvoiceDTO[]> {
    return new ListMyPayableInvoicesController(
      this.cardQueryRepository!,
      this.invoicePaymentRepository!,
    ).execute(ownerId, period, charges)
  }

  async setInvoicePaid(
    cardId: string,
    period: string,
    paid: boolean,
    ownerId: string,
  ): Promise<void> {
    await new SetInvoicePaidController(this.cardRepository!, this.invoicePaymentRepository!).execute(
      cardId,
      period,
      paid,
      ownerId,
    )
  }
}
