import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DbModule } from './db/db.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { CategoryModule } from './category/category.module'
import { TransactionModule } from './transaction/transaction.module'
import { BudgetModule } from './budget/budget.module'
import { IncomeModule } from './income/income.module'
import { ReportModule } from './report/report.module'
import { UploadModule } from './upload/upload.module'
import { NotificationModule } from './notification/notification.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    AuthModule,
    UserModule,
    CategoryModule,
    TransactionModule,
    BudgetModule,
    IncomeModule,
    ReportModule,
    UploadModule,
    NotificationModule,
  ],
})
export class AppModule {}
