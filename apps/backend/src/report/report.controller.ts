import { Controller, Get, Query } from '@nestjs/common'
import { TransactionFacade, CategoryTotalDTO } from '@transaction/adapters'
import { IncomeFacade } from '@income/adapters'
import { BudgetFacade, BudgetUsageDTO } from '@budget/adapters'
import { UserDTO } from '@auth/adapters'
import { MonthPeriod } from 'shared'
import { PrismaTransactionRepository } from '../transaction/prisma-transaction-repository'
import { PrismaIncomeSourceRepository } from '../income/prisma-income-source-repository'
import { PrismaBudgetRepository } from '../budget/prisma-budget-repository'
import { authenticatedUser } from '../shared/authenticated-user.decorator'

/**
 * The composed cross-context read model that answers the question the product
 * exists for: "how much is left this month?".
 *
 * No single context owns this shape, so it is assembled HERE in the app layer —
 * `plannedIncome` comes from `income`, the totals from `transaction`, the
 * ceilings from `budget`. Never exported from an adapters package; the front
 * mirrors the type by hand, which is the honest cost of a shape that belongs to
 * no context.
 */
interface MonthlyReportDTO {
  period: string
  /** What the active income sources promise for the month. */
  plannedIncomeCents: number
  /** Income actually recorded as a movement (a freelance job, a refund). */
  realizedIncomeCents: number
  expenseCents: number
  /** planned + realized − expenses: the number the dashboard leads with. */
  leftoverCents: number
  byCategory: CategoryTotalDTO[]
  budgets: BudgetUsageDTO[]
}

@Controller('report')
export class ReportController {
  constructor(
    private readonly transactionRepository: PrismaTransactionRepository,
    private readonly incomeRepository: PrismaIncomeSourceRepository,
    private readonly budgetRepository: PrismaBudgetRepository,
  ) {}

  @Get('monthly')
  async monthly(
    @authenticatedUser() user: UserDTO,
    @Query('period') period?: string,
  ): Promise<MonthlyReportDTO> {
    // Validated here so a bad ?period answers 400 from the value object rather
    // than silently reporting on the wrong month.
    const month = new MonthPeriod(period ?? MonthPeriod.of().value)

    const [totals, income] = await Promise.all([
      new TransactionFacade(undefined, this.transactionRepository).getMyMonthlyTotals(
        user.id,
        month.value,
      ),
      new IncomeFacade(undefined, this.incomeRepository).getMyMonthlyIncome(user.id),
    ])

    const spending = totals.byCategory
      .filter((total): total is { categoryId: string; spentCents: number } => total.categoryId !== null)
      .map((total) => ({ categoryId: total.categoryId, spentCents: total.spentCents }))
    const budgets = await new BudgetFacade(undefined, this.budgetRepository).getMyBudgetUsage(
      user.id,
      spending,
    )

    return {
      period: month.value,
      plannedIncomeCents: income.totalCents,
      realizedIncomeCents: totals.incomeCents,
      expenseCents: totals.expenseCents,
      leftoverCents: income.totalCents + totals.incomeCents - totals.expenseCents,
      byCategory: totals.byCategory,
      budgets,
    }
  }
}
