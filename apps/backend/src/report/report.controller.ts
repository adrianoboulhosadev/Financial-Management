import { Controller, Get, Query } from '@nestjs/common'
import { TransactionFacade, CategoryTotalDTO } from '@transaction/adapters'
import { IncomeFacade } from '@income/adapters'
import { BudgetFacade, BudgetUsageDTO } from '@budget/adapters'
import { UserDTO } from '@auth/adapters'
import { MonthPeriod } from 'shared'
import { PrismaTransactionRepository } from '../transaction/prisma-transaction-repository'
import { PrismaRecurrenceRepository } from '../transaction/prisma-recurrence-repository'
import { PrismaIncomeSourceRepository } from '../income/prisma-income-source-repository'
import { PrismaBudgetRepository } from '../budget/prisma-budget-repository'
import { authenticatedUser } from '../shared/authenticated-user.decorator'

/**
 * The composed cross-context read model that answers the question the product
 * exists for: "how much is left this month?".
 *
 * No single context owns this shape, so it is assembled HERE in the app layer —
 * `plannedIncome` comes from `income`, the totals (movements AND the month's
 * unpaid fixed bills) from `transaction`, the ceilings from `budget`. Never exported from an adapters package; the front
 * mirrors the type by hand, which is the honest cost of a shape that belongs to
 * no context.
 */
interface MonthlyReportDTO {
  period: string
  /** What the active income sources promise for the month. */
  plannedIncomeCents: number
  /** Income actually recorded as a movement (a freelance job, a refund). */
  realizedIncomeCents: number
  /** Expenses that actually MOVED. */
  expenseCents: number
  /** The month's fixed bills that have not been posted yet — money the month
   * already owes. */
  committedExpenseCents: number
  /** expenses + commitments: what the dashboard shows as "saiu", so a month
   * with 3.000 of fixed bills does not read as 400 spent on the 3rd. */
  totalExpenseCents: number
  /** planned + realized income − totalExpense: the number the dashboard leads
   * with. */
  leftoverCents: number
  /** Money that moved, per category — what the ceilings are measured against. */
  byCategory: CategoryTotalDTO[]
  /** The same split with the month's unpaid fixed bills folded in: what the
   * charts rank, so the ranking adds up to `totalExpenseCents`. */
  totalByCategory: CategoryTotalDTO[]
  budgets: BudgetUsageDTO[]
}

@Controller('report')
export class ReportController {
  constructor(
    private readonly transactionRepository: PrismaTransactionRepository,
    private readonly recurrenceRepository: PrismaRecurrenceRepository,
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
      // The recurrence port is what makes the totals carry the month's unpaid
      // fixed bills alongside what actually moved.
      new TransactionFacade(
        undefined,
        this.transactionRepository,
        undefined,
        this.recurrenceRepository,
      ).getMyMonthlyTotals(user.id, month.value),
      new IncomeFacade(undefined, this.incomeRepository).getMyMonthlyIncome(user.id),
    ])

    const spending = totals.byCategory
      .filter((total): total is { categoryId: string; spentCents: number } => total.categoryId !== null)
      .map((total) => ({ categoryId: total.categoryId, spentCents: total.spentCents }))
    const budgets = await new BudgetFacade(undefined, this.budgetRepository).getMyBudgetUsage(
      user.id,
      spending,
    )

    const totalExpenseCents = totals.expenseCents + totals.committedExpenseCents

    return {
      period: month.value,
      plannedIncomeCents: income.totalCents,
      realizedIncomeCents: totals.incomeCents,
      expenseCents: totals.expenseCents,
      committedExpenseCents: totals.committedExpenseCents,
      totalExpenseCents,
      // A month with 4.000 of income and 3.000 of fixed bills has 600 left over
      // after 400 of loose spending — not 3.600. Counting only what moved would
      // tell the owner they can spend money that is already promised.
      leftoverCents: income.totalCents + totals.incomeCents - totalExpenseCents,
      byCategory: totals.byCategory,
      totalByCategory: totals.totalByCategory,
      budgets,
    }
  }
}
