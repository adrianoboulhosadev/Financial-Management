import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common'
import { BudgetFacade, BudgetDTO, BudgetUsageDTO, SetBudgetInput } from '@budget/adapters'
import { TransactionFacade } from '@transaction/adapters'
import { UserDTO } from '@auth/adapters'
import { MonthPeriod } from 'shared'
import { PrismaBudgetRepository } from './prisma-budget-repository'
import { PrismaTransactionRepository } from '../transaction/prisma-transaction-repository'
import { PrismaCategoryRepository } from '../category/prisma-category-repository'
import { CategoryResolver } from '../transaction/category-resolver'
import { authenticatedUser } from '../shared/authenticated-user.decorator'
import { requireFields } from '../shared/require-fields'

/**
 * The user's own ceilings. Protected by the AuthMiddleware (see budget.module).
 *
 * `/usage` is the cross-context read: the ceilings come from `budget` and what
 * the month consumed comes from `transaction`, crossed here in the app layer —
 * neither context imports the other.
 */
@Controller('budget')
export class BudgetController {
  constructor(
    private readonly budgetRepository: PrismaBudgetRepository,
    private readonly transactionRepository: PrismaTransactionRepository,
    private readonly categoryRepository: PrismaCategoryRepository,
  ) {}

  private facade(): BudgetFacade {
    return new BudgetFacade(this.budgetRepository, this.budgetRepository)
  }

  @Get()
  list(@authenticatedUser() user: UserDTO): Promise<BudgetDTO[]> {
    return this.facade().listMyBudgets(user.id)
  }

  @Get('usage')
  async usage(
    @authenticatedUser() user: UserDTO,
    @Query('period') period?: string,
  ): Promise<BudgetUsageDTO[]> {
    const month = period ?? MonthPeriod.of().value
    const totals = await new TransactionFacade(
      undefined,
      this.transactionRepository,
    ).getMyMonthlyTotals(user.id, month)

    // Only the categories the month actually spent on; a category with no
    // expenses simply does not appear, and the calculator reads it as zero.
    const spending = totals.byCategory
      .filter((total): total is { categoryId: string; spentCents: number } => total.categoryId !== null)
      .map((total) => ({ categoryId: total.categoryId, spentCents: total.spentCents }))

    return this.facade().getMyBudgetUsage(user.id, spending)
  }

  @Post()
  @HttpCode(201)
  async set(@Body() input: SetBudgetInput, @authenticatedUser() user: UserDTO) {
    requireFields(input, ['categoryId', 'amount'])
    const isLeaf = await new CategoryResolver(this.categoryRepository).isLeafOf(
      input.categoryId,
      user.id,
    )
    await this.facade().setBudget(input, user.id, isLeaf)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @authenticatedUser() user: UserDTO) {
    await this.facade().deleteBudget(id, user.id)
  }
}
