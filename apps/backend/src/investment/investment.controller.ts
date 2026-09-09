import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import {
  InvestmentFacade,
  InvestmentDTO,
  PortfolioDTO,
  CreateInvestmentInput,
  UpdateInvestmentInput,
  SetInvestmentActiveInput,
} from '@investment/adapters'
import { UserDTO } from '@auth/adapters'
import { PrismaInvestmentRepository } from './prisma-investment-repository'
import { PaymentSourceResolver } from '../bank/payment-source.resolver'
import { authenticatedUser } from '../shared/authenticated-user.decorator'
import { requireFields } from '../shared/require-fields'

/**
 * The user's own investments. Protected by the AuthMiddleware (see
 * investment.module): the ownerId ALWAYS comes from the token (anti-IDOR).
 *
 * The one cross-context job happens here, in the app layer, because neither
 * context may import the other: confirming the bank an investment is held at
 * belongs to this user.
 */
@Controller('investment')
export class InvestmentController {
  constructor(
    private readonly repository: PrismaInvestmentRepository,
    private readonly paymentSources: PaymentSourceResolver,
  ) {}

  private facade(): InvestmentFacade {
    return new InvestmentFacade(this.repository, this.repository)
  }

  @Get()
  list(@authenticatedUser() user: UserDTO): Promise<InvestmentDTO[]> {
    return this.facade().listMyInvestments(user.id)
  }

  /** What the portfolio is worth: applied, current, return, and the split per
   * kind. */
  @Get('portfolio')
  portfolio(@authenticatedUser() user: UserDTO): Promise<PortfolioDTO> {
    return this.facade().getMyPortfolio(user.id)
  }

  @Post()
  @HttpCode(201)
  async create(@Body() input: CreateInvestmentInput, @authenticatedUser() user: UserDTO) {
    requireFields(input, ['name', 'kind', 'investedAmount', 'startedOn'])
    await this.paymentSources.ensureOwned(user.id, input.bankId)
    await this.facade().createInvestment(input, user.id)
  }

  @Patch(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateInvestmentInput,
    @authenticatedUser() user: UserDTO,
  ) {
    await this.paymentSources.ensureOwned(user.id, input.bankId)
    await this.facade().updateInvestment(id, input, user.id)
  }

  /** Redeemed (or brought back). Deactivating keeps the row and only drops it
   * out of the portfolio total. */
  @Post(':id/active')
  @HttpCode(204)
  async setActive(
    @Param('id') id: string,
    @Body() input: SetInvestmentActiveInput,
    @authenticatedUser() user: UserDTO,
  ) {
    requireFields(input, ['active'])
    await this.facade().setInvestmentActive(id, input, user.id)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @authenticatedUser() user: UserDTO) {
    await this.facade().deleteInvestment(id, user.id)
  }
}
