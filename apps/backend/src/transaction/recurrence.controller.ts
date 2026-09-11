import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common'
import {
  TransactionFacade,
  RecurrenceDTO,
  MonthlyChecklistDTO,
  CreateRecurrenceInput,
  UpdateRecurrenceInput,
  SetRecurrenceActiveInput,
  SetRecurrencePaidInput,
  AdjustRecurrenceAmountInput,
} from '@transaction/adapters'
import { UserDTO } from '@auth/adapters'
import { MonthPeriod } from 'shared'
import { PrismaRecurrenceRepository } from './prisma-recurrence-repository'
import { PrismaRecurrencePaymentRepository } from './prisma-recurrence-payment-repository'
import { PaymentSourceResolver } from '../bank/payment-source.resolver'
import { PrismaCategoryRepository } from '../category/prisma-category-repository'
import { BullMqRecurrenceQueue } from './bullmq-recurrence-queue'
import { CategoryResolver } from './category-resolver'
import { authenticatedUser } from '../shared/authenticated-user.decorator'
import { requireFields } from '../shared/require-fields'

/**
 * Fixed monthly movements (rent, streaming, salary). Every write hands the queue
 * adapter to the facade, so the recurrence is scheduled the moment it exists —
 * the worker posts it and re-schedules the next month through the same port.
 *
 * `/checklist` and the two writes under it are the month's TO-DO LIST: what is
 * still to pay, what a variable bill actually came to, and what has been ticked
 * off. The list itself is derived from the recurrences, so nothing is generated
 * in advance and only the deviations are ever written.
 */
@Controller('recurrence')
export class RecurrenceController {
  constructor(
    private readonly recurrenceRepository: PrismaRecurrenceRepository,
    private readonly paymentRepository: PrismaRecurrencePaymentRepository,
    private readonly categoryRepository: PrismaCategoryRepository,
    private readonly queue: BullMqRecurrenceQueue,
    private readonly paymentSources: PaymentSourceResolver,
  ) {}

  private facade(): TransactionFacade {
    return new TransactionFacade(
      undefined,
      undefined,
      this.recurrenceRepository,
      this.recurrenceRepository,
      this.queue,
      this.paymentRepository,
    )
  }

  private categories(): CategoryResolver {
    return new CategoryResolver(this.categoryRepository)
  }

  @Get()
  list(@authenticatedUser() user: UserDTO): Promise<RecurrenceDTO[]> {
    return this.facade().listMyRecurrences(user.id)
  }

  /** The month's to-do list: every active fixed bill, what it costs and whether
   * it is settled. */
  @Get('checklist')
  checklist(
    @authenticatedUser() user: UserDTO,
    @Query('period') period?: string,
  ): Promise<MonthlyChecklistDTO> {
    return this.facade().getMonthlyChecklist(
      user.id,
      MonthPeriod.readableBy(period, user.createdAt).value,
    )
  }

  @Post()
  @HttpCode(201)
  async create(@Body() input: CreateRecurrenceInput, @authenticatedUser() user: UserDTO) {
    requireFields(input, ['type', 'description', 'amount', 'dayOfMonth'])
    await this.categories().ensureOwned(input.categoryId, user.id)
    await this.paymentSources.ensureOwned(user.id, input.bankId, input.cardId)
    await this.facade().createRecurrence(input, user.id)
  }

  @Patch(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateRecurrenceInput,
    @authenticatedUser() user: UserDTO,
  ) {
    await this.categories().ensureOwned(input.categoryId, user.id)
    await this.paymentSources.ensureOwned(user.id, input.bankId, input.cardId)
    await this.facade().updateRecurrence(id, input, user.id)
  }

  @Post(':id/active')
  @HttpCode(204)
  async setActive(
    @Param('id') id: string,
    @Body() input: SetRecurrenceActiveInput,
    @authenticatedUser() user: UserDTO,
  ) {
    requireFields(input, ['active'])
    await this.facade().setRecurrenceActive(id, input, user.id)
  }

  /** Ticks one month off the checklist, or un-ticks it. */
  @Post(':id/paid')
  @HttpCode(204)
  async setPaid(
    @Param('id') id: string,
    @Body() input: SetRecurrencePaidInput,
    @authenticatedUser() user: UserDTO,
  ) {
    requireFields(input, ['period', 'paid'])
    await this.facade().setRecurrencePaid(id, input, user.id)
  }

  /** What a VARIABLE bill actually came to this month — a null amount clears
   * the adjustment and puts the estimate back in charge. */
  @Post(':id/amount')
  @HttpCode(204)
  async adjustAmount(
    @Param('id') id: string,
    @Body() input: AdjustRecurrenceAmountInput,
    @authenticatedUser() user: UserDTO,
  ) {
    requireFields(input, ['period'])
    await this.facade().adjustRecurrenceAmount(id, input, user.id)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @authenticatedUser() user: UserDTO) {
    await this.facade().deleteRecurrence(id, user.id)
  }
}
