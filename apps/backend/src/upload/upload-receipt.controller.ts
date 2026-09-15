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
import { RECEIPTS_UPLOAD_DIR } from './uploads.config'
import { OrphanUploadResolver } from './orphan-upload.resolver'

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024 // 10 MB

// Guarded by the AuthMiddleware only (see upload.module): any authenticated user
// attaches their OWN receipt/invoice to a movement they are recording. The file
// is stored locally under uploads/receipts/ and the public URL (served at
// /uploads/**) is saved on the Transaction (attachmentUrl), which already
// carries the owner's id.
//
// This is the one upload that also accepts a PDF, and the one that is NEVER
// cropped or re-encoded: it is a document, and altering it would be altering
// the proof.
@Controller('upload')
export class UploadReceiptController {
  constructor(private readonly orphans: OrphanUploadResolver) {}

  @Post('receipts')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: RECEIPTS_UPLOAD_DIR,
        filename: (_req, file, callback) =>
          callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
      }),
      limits: { fileSize: MAX_RECEIPT_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
          return callback(new BadRequestException('Only image or PDF files are allowed'), false)
        }
        callback(null, true)
      },
    }),
  )
  uploadReceipt(@UploadedFile() file?: Express.Multer.File): { url: string } {
    if (!file) throw new BadRequestException('No receipt uploaded')
    return { url: `/uploads/receipts/${file.filename}` }
  }

  /**
   * Drops a receipt nothing points at — the file that went up before the form
   * was submitted and was then discarded.
   *
   * A receipt still attached to a movement answers as MISSING, and that is the
   * whole guard: it keeps the owner from deleting the proof out from under
   * their own record, and it keeps somebody else's from being probed for here.
   * Detaching one that is attached goes through the movement (PATCH), which is
   * what makes it an orphan in the first place.
   */
  @Delete('receipts/:filename')
  @HttpCode(204)
  async removeReceipt(@Param('filename') filename: string) {
    await this.orphans.remove(RECEIPTS_UPLOAD_DIR, filename, `/uploads/receipts/${filename}`)
  }
}
