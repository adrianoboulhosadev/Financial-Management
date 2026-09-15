import * as dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import { mkdirSync } from 'fs'
import { join } from 'path'

import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { DomainExceptionFilter } from './shared/domain-exception.filter'
import { UPLOADS_DIR, UPLOADS_SUBDIRS } from './upload/uploads.config'
import { OrphanUploadResolver } from './upload/orphan-upload.resolver'

async function bootstrap() {
  // Local (no cloud) file storage: ensure the uploads root and its per-theme
  // subfolders (e.g. uploads/receipts) exist before multer writes into them.
  for (const subdir of UPLOADS_SUBDIRS) {
    mkdirSync(join(UPLOADS_DIR, subdir), { recursive: true })
  }

  // CORS with credentials: the SPA sends the refresh cookie, so it needs a
  // specific origin (a wildcard is not allowed together with credentials).
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: { origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000', credentials: true },
  })
  app.use(cookieParser())
  app.useGlobalFilters(new DomainExceptionFilter())
  // Serve the uploaded files statically at /uploads/** (e.g. /uploads/receipts/x.pdf).
  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads/' })
  await app.listen(process.env.PORT ?? 5000)

  // Sweep the uploads nobody ever named. It runs AFTER listen and is never
  // awaited: it is housekeeping, and a server that refused to serve traffic
  // because a stale file would not delete would be trading a real problem for
  // an imaginary one. Same reason the failure is only logged.
  app
    .get(OrphanUploadResolver)
    .sweep()
    .then((removed) => {
      if (removed > 0) console.log(`[uploads] ${removed} orphaned file(s) swept`)
    })
    .catch((error) => console.error('[uploads] sweep failed', error))
}
bootstrap()
