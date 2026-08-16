import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { AuthModule } from '../auth/auth.module'
import { AuthMiddleware } from '../auth/auth.middleware'
import { CategoryController } from './category.controller'
import { PrismaCategoryRepository } from './prisma-category-repository'
import { PrismaTransactionRepository } from '../transaction/prisma-transaction-repository'
import { PrismaRecurrenceRepository } from '../transaction/prisma-recurrence-repository'
import { PrismaBudgetRepository } from '../budget/prisma-budget-repository'

/**
 * The three foreign repositories are declared here (not imported from their
 * modules) because they are stateless wrappers over the global PrismaService,
 * and because the alternative — importing TransactionModule and BudgetModule —
 * would build a cycle: both of those already import this one to resolve whether
 * a category is a leaf.
 */
@Module({
  imports: [DbModule, AuthModule],
  controllers: [CategoryController],
  providers: [
    PrismaCategoryRepository,
    PrismaTransactionRepository,
    PrismaRecurrenceRepository,
    PrismaBudgetRepository,
  ],
  exports: [PrismaCategoryRepository],
})
export class CategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(CategoryController)
  }
}
