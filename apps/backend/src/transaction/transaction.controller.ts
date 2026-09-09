import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common'
import {
  TransactionFacade,
  TransactionDTO,
  MonthlyTotalsDTO,
  RecordTransactionInput,
  UpdateTransactionInput,
} from '@transaction/adapters'
import { UserDTO } from '@auth/adapters'
import { MonthPeriod } from 'shared'
import { PrismaTransactionRepository } from './prisma-transaction-repository'
import { PrismaCategoryRepository } from '../category/prisma-category-repository'
import { BullMqBudgetCheckQueue } from '../budget/bullmq-budget-check-queue'
import { CategoryResolver } from './category-resolver'
import { PaymentSourceResolver } from '../bank/payment-source.resolver'
import { authenticatedUser } from '../shared/authenticated-user.decorator'
import { requireFields } from '../shared/require-fields'

/**
 * The user's own movements. Protected by the AuthMiddleware (see
 * transaction.module): the ownerId ALWAYS comes from the token (anti-IDOR).
 *
 * Three cross-context jobs happen here, in the app layer, because no context
 * may import another:
 * - confirming the chosen category belongs to THIS user (any node of the tree
 *   will do — branch or leaf);
 * - confirming the bank/card the money went through is this user's too;
 * - enqueueing the budget check after an expense, so the ceiling is re-evaluated
 *   without slowing down (or endangering) the write itself.
 */
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionRepository: PrismaTransactionRepository,
    private readonly categoryRepository: PrismaCategoryRepository,
    private readonly budgetCheckQueue: BullMqBudgetCheckQueue,
    private readonly paymentSources: PaymentSourceResolver,
  ) {}

  private facade(): TransactionFacade {
    return new TransactionFacade(this.transactionRepository, this.transactionRepository)
  }

  private categories(): CategoryResolver {
    return new CategoryResolver(this.categoryRepository)
  }

  @Get()
  list(
    @authenticatedUser() user: UserDTO,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
    @Query('period') period?: string,
  ): Promise<TransactionDTO[]> {
    // `period` is the convenient form the screens actually use (a whole month);
    // from/to stay available for anything wider or narrower.
    const month = period ? new MonthPeriod(period) : null
    return this.facade().listMyTransactions(user.id, {
      from: month ? month.start : from ? new Date(from) : undefined,
      to: month ? month.end : to ? new Date(to) : undefined,
      type: type === 'expense' || type === 'income' ? type : undefined,
      categoryId,
    })
  }

  /** What the month adds up to (in, out, what is left, and per category). */
  @Get('summary')
  summary(
    @authenticatedUser() user: UserDTO,
    @Query('period') period?: string,
  ): Promise<MonthlyTotalsDTO> {
    return this.facade().getMyMonthlyTotals(user.id, period ?? MonthPeriod.of().value)
  }

  @Post()
  @HttpCode(201)
  async record(@Body() input: RecordTransactionInput, @authenticatedUser() user: UserDTO) {
    requireFields(input, ['type', 'description', 'amount', 'occurredOn'])
    await this.categories().ensureOwned(input.categoryId, user.id)
    await this.paymentSources.ensureOwned(user.id, input.bankId, input.cardId)

    await this.facade().recordTransaction(input, user.id)
    await this.checkBudget(user.id, input.type, input.categoryId, input.occurredOn)
  }

  @Patch(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateTransactionInput,
    @authenticatedUser() user: UserDTO,
  ) {
    await this.categories().ensureOwned(input.categoryId, user.id)
    await this.paymentSources.ensureOwned(user.id, input.bankId, input.cardId)
    await this.facade().updateTransaction(id, input, user.id)

    // An edit moves money around just as much as a new entry does — a raised
    // amount can be exactly what breaks the ceiling.
    const updated = await this.transactionRepository.findByIdQuery(id)
    if (updated) {
      await this.checkBudget(
        user.id,
        updated.type,
        updated.categoryId,
        updated.occurredOn.toISOString(),
      )
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @authenticatedUser() user: UserDTO) {
    // No budget check on the way out: deleting an expense only ever moves the
    // month further AWAY from its ceiling, and there is no good news to notify.
    await this.facade().deleteTransaction(id, user.id)
  }

  /** Only an expense filed on a category can cross a ceiling. */
  private async checkBudget(
    ownerId: string,
    type: string,
    categoryId: string | null | undefined,
    occurredOn: string,
  ): Promise<void> {
    if (type !== 'expense' || !categoryId) return
    // The month the movement was FILED under, so an expense backdated to last
    // month is checked against last month's spending, not this one's.
    const period = MonthPeriod.of(new Date(occurredOn)).value
    await this.budgetCheckQueue.enqueueCheck({ ownerId, categoryId, period })
  }
}
