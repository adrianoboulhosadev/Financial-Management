import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { AuthModule } from '../auth/auth.module'
import { AuthMiddleware } from '../auth/auth.middleware'
import { TransactionModule } from '../transaction/transaction.module'
import { IncomeModule } from '../income/income.module'
import { BudgetModule } from '../budget/budget.module'
import { ReportController } from './report.controller'

/** Owns no repository of its own: it only crosses what three other modules
 * already export. */
@Module({
  imports: [DbModule, AuthModule, TransactionModule, IncomeModule, BudgetModule],
  controllers: [ReportController],
})
export class ReportModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ReportController)
  }
}
