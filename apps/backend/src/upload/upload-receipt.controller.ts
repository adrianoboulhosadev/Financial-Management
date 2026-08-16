import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { randomUUID } from 'crypto'
import { RECEIPTS_UPLOAD_DIR } from './uploads.config'

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
}
