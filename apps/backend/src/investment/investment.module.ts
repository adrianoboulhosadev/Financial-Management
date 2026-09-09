import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { AuthModule } from '../auth/auth.module'
import { AuthMiddleware } from '../auth/auth.middleware'
import { BankModule } from '../bank/bank.module'
import { InvestmentController } from './investment.controller'
import { PrismaInvestmentRepository } from './prisma-investment-repository'

/**
 * `forwardRef` because the two modules genuinely need each other and neither is
 * the parent: an investment has to confirm its bank belongs to the caller, and
 * a bank has to know whether an investment still points at it before it can be
 * deleted.
 */
@Module({
  imports: [DbModule, AuthModule, forwardRef(() => BankModule)],
  controllers: [InvestmentController],
  providers: [PrismaInvestmentRepository],
  exports: [PrismaInvestmentRepository],
})
export class InvestmentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(InvestmentController)
  }
}
