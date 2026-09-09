import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { AuthModule } from '../auth/auth.module'
import { AuthMiddleware } from '../auth/auth.middleware'
import { CategoryModule } from '../category/category.module'
import { TransactionController } from './transaction.controller'
import { RecurrenceController } from './recurrence.controller'
import { PrismaTransactionRepository } from './prisma-transaction-repository'
import { PrismaRecurrenceRepository } from './prisma-recurrence-repository'
import { PrismaRecurrencePaymentRepository } from './prisma-recurrence-payment-repository'
import { BullMqRecurrenceQueue } from './bullmq-recurrence-queue'
import { BullMqBudgetCheckQueue } from '../budget/bullmq-budget-check-queue'
import { BankModule } from '../bank/bank.module'

@Module({
  imports: [DbModule, AuthModule, CategoryModule, forwardRef(() => BankModule)],
  controllers: [TransactionController, RecurrenceController],
  providers: [
    PrismaTransactionRepository,
    PrismaRecurrenceRepository,
    PrismaRecurrencePaymentRepository,
    BullMqRecurrenceQueue,
    BullMqBudgetCheckQueue,
  ],
  exports: [
    PrismaTransactionRepository,
    PrismaRecurrenceRepository,
    PrismaRecurrencePaymentRepository,
  ],
})
export class TransactionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(TransactionController, RecurrenceController)
  }
}
