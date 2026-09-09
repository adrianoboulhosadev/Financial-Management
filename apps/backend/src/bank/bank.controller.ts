import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import {
  BankFacade,
  BankDTO,
  CardDTO,
  CreateBankInput,
  UpdateBankInput,
  CreateCardInput,
  UpdateCardInput,
} from '@bank/adapters'
import { UserDTO } from '@auth/adapters'
import { PrismaBankRepository } from './prisma-bank-repository'
import { PrismaCardRepository } from './prisma-card-repository'
import { BankUsageResolver } from './bank-usage.resolver'
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
  ) {}

  private facade(): BankFacade {
    return new BankFacade(
      this.bankRepository,
      this.bankRepository,
      this.cardRepository,
      this.cardRepository,
    )
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
