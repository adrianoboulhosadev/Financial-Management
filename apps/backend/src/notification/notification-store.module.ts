import { Module } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { PrismaNotificationRepository } from './prisma-notification-repository'
import { LiveUpdates } from './live-updates'

/**
 * The WRITE side of notifications, with no controller and no dependency on
 * AuthModule — that is the whole point of splitting it out of
 * NotificationModule. AuthModule is what provides the AuthMiddleware the
 * notification controller needs, so keeping this side free of auth is what
 * stops the two imports from becoming a cycle.
 */
@Module({
  imports: [DbModule],
  providers: [PrismaNotificationRepository, LiveUpdates],
  exports: [PrismaNotificationRepository, LiveUpdates],
})
export class NotificationStoreModule {}
