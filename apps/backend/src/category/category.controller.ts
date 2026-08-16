import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import { CategoryFacade, CategoryDTO, CreateCategoryInput, UpdateCategoryInput } from '@category/adapters'
import { UserDTO } from '@auth/adapters'
import { PrismaCategoryRepository } from './prisma-category-repository'
import { PrismaTransactionRepository } from '../transaction/prisma-transaction-repository'
import { PrismaRecurrenceRepository } from '../transaction/prisma-recurrence-repository'
import { PrismaBudgetRepository } from '../budget/prisma-budget-repository'
import { authenticatedUser } from '../shared/authenticated-user.decorator'
import { requireFields } from '../shared/require-fields'

/**
 * The user's own category tree. Protected by the AuthMiddleware (see
 * category.module): the ownerId ALWAYS comes from the token (anti-IDOR), and a
 * node belonging to somebody else answers as missing.
 */
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryRepository: PrismaCategoryRepository,
    private readonly transactionRepository: PrismaTransactionRepository,
    private readonly recurrenceRepository: PrismaRecurrenceRepository,
    private readonly budgetRepository: PrismaBudgetRepository,
  ) {}

  private facade(): CategoryFacade {
    return new CategoryFacade(this.categoryRepository, this.categoryRepository)
  }

  @Get()
  list(@authenticatedUser() user: UserDTO): Promise<CategoryDTO[]> {
    return this.facade().listMyCategories(user.id)
  }

  @Post()
  @HttpCode(201)
  async create(@Body() input: CreateCategoryInput, @authenticatedUser() user: UserDTO) {
    requireFields(input, ['name'])
    await this.facade().createCategory(input, user.id)
  }

  @Patch(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateCategoryInput,
    @authenticatedUser() user: UserDTO,
  ) {
    requireFields(input, ['name'])
    await this.facade().updateCategory(id, input, user.id)
  }

  /**
   * The CATEGORY_IN_USE rule lives in the `category` context, but the ANSWER
   * lives in the other three — a category is in use when a movement, a fixed
   * movement or a ceiling still points at it. Resolving it here is the app
   * layer doing its job: `category` never imports `transaction` or `budget`.
   */
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @authenticatedUser() user: UserDTO) {
    const [usedByTransaction, usedByRecurrence, usedByBudget] = await Promise.all([
      this.transactionRepository.existsByCategory(id),
      this.recurrenceRepository.existsByCategory(id),
      this.budgetRepository.existsByCategory(id),
    ])
    const inUse = usedByTransaction || usedByRecurrence || usedByBudget

    await this.facade().deleteCategory(id, user.id, inUse)
  }
}
