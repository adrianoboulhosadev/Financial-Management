import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { AuthModule } from '../auth/auth.module'
import { AuthMiddleware } from '../auth/auth.middleware'
import { CategoryModule } from '../category/category.module'
import { TransactionModule } from '../transaction/transaction.module'
import { BudgetController } from './budget.controller'
import { PrismaBudgetRepository } from './prisma-budget-repository'

@Module({
  imports: [DbModule, AuthModule, CategoryModule, TransactionModule],
  controllers: [BudgetController],
  providers: [PrismaBudgetRepository],
  exports: [PrismaBudgetRepository],
})
export class BudgetModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(BudgetController)
  }
}
