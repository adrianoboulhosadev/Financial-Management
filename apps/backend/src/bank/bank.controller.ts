import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common'
import {
  BankFacade,
  BankDTO,
  CardDTO,
  CardInvoicesDTO,
  PayableInvoiceDTO,
  CreateBankInput,
  UpdateBankInput,
  CreateCardInput,
  UpdateCardInput,
} from '@bank/adapters'
import { UserDTO } from '@auth/adapters'
import { MonthPeriod } from 'shared'
import { PrismaBankRepository } from './prisma-bank-repository'
import { PrismaCardRepository } from './prisma-card-repository'
import { PrismaCardInvoicePaymentRepository } from './prisma-card-invoice-payment-repository'
import { BankUsageResolver } from './bank-usage.resolver'
import { CardChargeResolver } from './card-charge.resolver'
import { authenticatedUser } from '../shared/authenticated-user.decorator'
import { requireFields } from '../shared/require-fields'

/**
 * The user's own banks and the cards hanging from them. Protected by the
 * AuthMiddleware (see bank.module): the ownerId ALWAYS comes from the token
 * (anti-IDOR), and a bank belonging to somebody else answers as missing.
 *
 * The cards live under `/bank/card` rather than in a controller of their own
 * because they are never reached without a bank — one screen manages both, and
 * one route prefix keeps `/bank/:id` from swallowing `/bank/card`, which is why
 * the card routes are declared FIRST.
 */
@Controller('bank')
export class BankController {
  constructor(
    private readonly bankRepository: PrismaBankRepository,
    private readonly cardRepository: PrismaCardRepository,
    private readonly usage: BankUsageResolver,
    private readonly charges: CardChargeResolver,
    private readonly invoicePaymentRepository: PrismaCardInvoicePaymentRepository,
  ) {}

  private facade(): BankFacade {
    return new BankFacade(
      this.bankRepository,
      this.bankRepository,
      this.cardRepository,
      this.cardRepository,
      this.invoicePaymentRepository,
    )
  }

  /**
   * The invoices of every credit card the caller owns. Declared BEFORE `/:id`
   * for the same reason the card routes are: a literal segment loses to a
   * parameter that was registered first.
   *
   * Composed here, in the app layer: the cards come from `bank` and the charges
   * from `transaction`, and they meet as plain data rather than as an import
   * between two contexts.
   */
  @Get('card/invoice')
  async cardInvoices(@authenticatedUser() user: UserDTO): Promise<CardInvoicesDTO[]> {
    return this.facade().listMyCardInvoices(user.id, await this.charges.listByOwner(user.id))
  }

  /**
   * The invoices this month has to SETTLE — one line per credit card, for the
   * "A pagar" screen.
   *
   * An invoice is never an expense: every charge on it was already recorded as
   * a movement on the day it was made, so the screen keeps it in a section of
   * its own and out of the month's totals. Counting it again would count the
   * same money twice.
   */
  @Get('card/invoice/payable')
  async payableInvoices(
    @authenticatedUser() user: UserDTO,
    @Query('period') period?: string,
  ): Promise<PayableInvoiceDTO[]> {
    const month = MonthPeriod.readableBy(period, user.createdAt)
    return this.facade().listMyPayableInvoices(
      user.id,
      month.value,
      await this.charges.listByOwnerForPeriod(user.id, month),
    )
  }

  /** Ticks one invoice off the month's list, or un-ticks it. The period is the
   * month the invoice CLOSES in — its identity. */
  @Post('card/:id/invoice/paid')
  @HttpCode(204)
  async setInvoicePaid(
    @Param('id') id: string,
    @Body() input: { period?: string; paid?: boolean },
    @authenticatedUser() user: UserDTO,
  ) {
    requireFields(input, ['period'])
    await this.facade().setInvoicePaid(id, input.period as string, input.paid !== false, user.id)
  }

  @Get('card')
  listCards(@authenticatedUser() user: UserDTO): Promise<CardDTO[]> {
    return this.facade().listMyCards(user.id)
  }

  @Post('card')
  @HttpCode(201)
  async createCard(@Body() input: CreateCardInput, @authenticatedUser() user: UserDTO) {
    requireFields(input, ['bankId', 'brand', 'kind', 'lastFourDigits'])
    await this.facade().createCard(input, user.id)
  }

  @Patch('card/:id')
  @HttpCode(204)
  async updateCard(
    @Param('id') id: string,
    @Body() input: UpdateCardInput,
    @authenticatedUser() user: UserDTO,
  ) {
    await this.facade().updateCard(id, input, user.id)
  }

  @Delete('card/:id')
  @HttpCode(204)
  async removeCard(@Param('id') id: string, @authenticatedUser() user: UserDTO) {
    await this.facade().deleteCard(id, user.id, await this.usage.cardInUse(id))
  }

  @Get()
  list(@authenticatedUser() user: UserDTO): Promise<BankDTO[]> {
    return this.facade().listMyBanks(user.id)
  }

  @Post()
  @HttpCode(201)
  async create(@Body() input: CreateBankInput, @authenticatedUser() user: UserDTO) {
    requireFields(input, ['name'])
    await this.facade().createBank(input, user.id)
  }

  @Patch(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateBankInput,
    @authenticatedUser() user: UserDTO,
  ) {
    await this.facade().updateBank(id, input, user.id)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @authenticatedUser() user: UserDTO) {
    // Whether money still points at it is the app layer's answer; the use case
    // only decides what to do with it.
    await this.facade().deleteBank(id, user.id, await this.usage.bankInUse(id))
  }
}
