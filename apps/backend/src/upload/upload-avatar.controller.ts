import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { randomUUID } from 'crypto'
import { AVATARS_UPLOAD_DIR } from './uploads.config'
import { OrphanUploadResolver } from './orphan-upload.resolver'

const MAX_AVATAR_BYTES = 5 * 1024 * 1024 // 5 MB

// Guarded by the AuthMiddleware only (see upload.module): any authenticated user
// uploads their OWN profile picture — same self-service shape as the receipt
// upload. The public URL is saved on User.avatarUrl via PATCH /user/me.
@Controller('upload')
export class UploadAvatarController {
  constructor(private readonly orphans: OrphanUploadResolver) {}

  @Post('avatars')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: AVATARS_UPLOAD_DIR,
        filename: (_req, file, callback) =>
          callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
      }),
      limits: { fileSize: MAX_AVATAR_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new BadRequestException('Only image files are allowed'), false)
        }
        callback(null, true)
      },
    }),
  )
  uploadAvatar(@UploadedFile() file?: Express.Multer.File): { url: string } {
    if (!file) throw new BadRequestException('No avatar uploaded')
    return { url: `/uploads/avatars/${file.filename}` }
  }

  /** Drops a photo nothing points at — the one that went up and was then
   * replaced or abandoned before PATCH /user/me saved it. One already on a
   * profile answers as missing. */
  @Delete('avatars/:filename')
  @HttpCode(204)
  async removeAvatar(@Param('filename') filename: string) {
    await this.orphans.remove(AVATARS_UPLOAD_DIR, filename, `/uploads/avatars/${filename}`)
  }
}
