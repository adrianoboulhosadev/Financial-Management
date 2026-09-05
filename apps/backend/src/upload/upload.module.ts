import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { AuthModule } from '../auth/auth.module'
import { AuthMiddleware } from '../auth/auth.middleware'
import { UploadReceiptController } from './upload-receipt.controller'
import { UploadAvatarController } from './upload-avatar.controller'

/**
 * Both uploads here are SELF-SERVICE: the authenticated user sends their own
 * receipt or their own avatar, so the AuthMiddleware is the whole guard.
 */
@Module({
  imports: [DbModule, AuthModule],
  controllers: [UploadReceiptController, UploadAvatarController],
})
export class UploadModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(UploadReceiptController, UploadAvatarController)
  }
}
