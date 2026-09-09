import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { AuthModule } from '../auth/auth.module'
import { AuthMiddleware } from '../auth/auth.middleware'
import { TransactionModule } from '../transaction/transaction.module'
import { InvestmentModule } from '../investment/investment.module'
import { BankController } from './bank.controller'
import { PrismaBankRepository } from './prisma-bank-repository'
import { PrismaCardRepository } from './prisma-card-repository'
import { BankUsageResolver } from './bank-usage.resolver'
import { PaymentSourceResolver } from './payment-source.resolver'

/** Imports the two modules whose repositories answer "is this bank still in
 * use?" — the app layer is the only place allowed to cross contexts. */
@Module({
  imports: [
    DbModule,
    AuthModule,
    forwardRef(() => TransactionModule),
    forwardRef(() => InvestmentModule),
  ],
  controllers: [BankController],
  providers: [
    PrismaBankRepository,
    PrismaCardRepository,
    BankUsageResolver,
    PaymentSourceResolver,
  ],
  exports: [PrismaBankRepository, PrismaCardRepository, PaymentSourceResolver],
})
export class BankModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(BankController)
  }
}
