import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import {
  IncomeFacade,
  IncomeSourceDTO,
  MonthlyIncomeDTO,
  CreateIncomeSourceInput,
  UpdateIncomeSourceInput,
  SetIncomeSourceActiveInput,
} from '@income/adapters'
import { UserDTO } from '@auth/adapters'
import { PrismaIncomeSourceRepository } from './prisma-income-source-repository'
import { authenticatedUser } from '../shared/authenticated-user.decorator'
import { requireFields } from '../shared/require-fields'

/** The user's own sources of income. Protected by the AuthMiddleware (see
 * income.module): the ownerId ALWAYS comes from the token (anti-IDOR). */
@Controller('income')
export class IncomeController {
  constructor(private readonly repository: PrismaIncomeSourceRepository) {}

  private facade(): IncomeFacade {
    return new IncomeFacade(this.repository, this.repository)
  }

  @Get()
  list(@authenticatedUser() user: UserDTO): Promise<IncomeSourceDTO[]> {
    return this.facade().listMyIncomeSources(user.id)
  }

  /** What the owner can count on this month (only the active sources). */
  @Get('monthly')
  monthly(@authenticatedUser() user: UserDTO): Promise<MonthlyIncomeDTO> {
    return this.facade().getMyMonthlyIncome(user.id)
  }

  @Post()
  @HttpCode(201)
  async create(@Body() input: CreateIncomeSourceInput, @authenticatedUser() user: UserDTO) {
    requireFields(input, ['name', 'amount', 'payday'])
    await this.facade().createIncomeSource(input, user.id)
  }

  @Patch(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateIncomeSourceInput,
    @authenticatedUser() user: UserDTO,
  ) {
    await this.facade().updateIncomeSource(id, input, user.id)
  }

  @Post(':id/active')
  @HttpCode(204)
  async setActive(
    @Param('id') id: string,
    @Body() input: SetIncomeSourceActiveInput,
    @authenticatedUser() user: UserDTO,
  ) {
    requireFields(input, ['active'])
    await this.facade().setIncomeSourceActive(id, input, user.id)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @authenticatedUser() user: UserDTO) {
    await this.facade().deleteIncomeSource(id, user.id)
  }
}
