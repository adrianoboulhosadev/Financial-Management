import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import {
  TransactionFacade,
  RecurrenceDTO,
  CreateRecurrenceInput,
  UpdateRecurrenceInput,
  SetRecurrenceActiveInput,
} from '@transaction/adapters'
import { UserDTO } from '@auth/adapters'
import { PrismaRecurrenceRepository } from './prisma-recurrence-repository'
import { PrismaCategoryRepository } from '../category/prisma-category-repository'
import { BullMqRecurrenceQueue } from './bullmq-recurrence-queue'
import { CategoryResolver } from './category-resolver'
import { authenticatedUser } from '../shared/authenticated-user.decorator'
import { requireFields } from '../shared/require-fields'

/**
 * Fixed monthly movements (rent, streaming, salary). Every write hands the queue
 * adapter to the facade, so the recurrence is scheduled the moment it exists —
 * the worker posts it and re-schedules the next month through the same port.
 */
@Controller('recurrence')
export class RecurrenceController {
  constructor(
    private readonly recurrenceRepository: PrismaRecurrenceRepository,
    private readonly categoryRepository: PrismaCategoryRepository,
    private readonly queue: BullMqRecurrenceQueue,
  ) {}

  private facade(): TransactionFacade {
    return new TransactionFacade(
      undefined,
      undefined,
      this.recurrenceRepository,
      this.recurrenceRepository,
      this.queue,
    )
  }

  private categories(): CategoryResolver {
    return new CategoryResolver(this.categoryRepository)
  }

  @Get()
  list(@authenticatedUser() user: UserDTO): Promise<RecurrenceDTO[]> {
    return this.facade().listMyRecurrences(user.id)
  }

  @Post()
  @HttpCode(201)
  async create(@Body() input: CreateRecurrenceInput, @authenticatedUser() user: UserDTO) {
    requireFields(input, ['type', 'description', 'amount', 'dayOfMonth'])
    const isLeaf = await this.categories().isLeafOf(input.categoryId, user.id)
    await this.facade().createRecurrence(input, user.id, isLeaf)
  }

  @Patch(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateRecurrenceInput,
    @authenticatedUser() user: UserDTO,
  ) {
    const isLeaf = await this.categories().isLeafOf(input.categoryId, user.id)
    await this.facade().updateRecurrence(id, input, user.id, isLeaf)
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

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @authenticatedUser() user: UserDTO) {
    await this.facade().deleteRecurrence(id, user.id)
  }
}
