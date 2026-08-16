import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { AuthModule } from '../auth/auth.module'
import { AuthMiddleware } from '../auth/auth.middleware'
import { IncomeController } from './income.controller'
import { PrismaIncomeSourceRepository } from './prisma-income-source-repository'

@Module({
  imports: [DbModule, AuthModule],
  controllers: [IncomeController],
  providers: [PrismaIncomeSourceRepository],
  exports: [PrismaIncomeSourceRepository],
})
export class IncomeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(IncomeController)
  }
}
