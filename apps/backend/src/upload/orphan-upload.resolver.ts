import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { rm } from 'fs/promises'
import { join, resolve, sep } from 'path'
import { PrismaService } from '../db/prisma.service'

/** What multer writes: a v4 uuid plus whatever extension the picked file had,
 * lowercased. Anything else is refused OUTRIGHT — it is the only thing standing
 * between a path parameter and the filesystem, so `..`, a slash and a stray
 * dot never reach `join` at all. */
const FILENAME_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-z0-9]{1,10})?$/

/**
 * Deletes an upload that nothing points at.
 *
 * The gap it closes: the file goes up BEFORE the form is submitted, so closing
 * the sheet without saving — or swapping one receipt for another — left the
 * first file on disk forever, with no row naming it and no way to find it
 * again.
 *
 * Only an UNREFERENCED file is ever removed, and that single rule does two jobs
 * at once. It keeps the owner from breaking their own record (a receipt still
 * attached to a movement is detached through the movement, never from under
 * it), and it is the anti-IDOR answer: a file somebody else's row points at
 * answers as missing, exactly like every other resource of theirs, so the route
 * cannot be used to ask whose receipt this is.
 *
 * ⚠️ What it does NOT do: prove the caller uploaded the file. Nothing records
 * who sent what, so an unreferenced file could in principle be deleted by
 * another user who guessed its name — which means guessing a v4 uuid, and the
 * prize is a file already destined for nobody. Recording the uploader would be
 * the airtight fix, and it costs a table; this is the trade that was taken.
 */
@Injectable()
export class OrphanUploadResolver {
  constructor(private readonly prisma: PrismaService) {}

  /** Removes `<directory>/<filename>` once nothing references `publicUrl`. */
  async remove(directory: string, filename: string, publicUrl: string): Promise<void> {
    if (!FILENAME_REGEX.test(filename)) {
      throw new BadRequestException('Invalid file name')
    }

    const path = join(directory, filename)
    // Belt and braces behind the regex: a path that climbed out of the folder
    // is never touched, whatever produced it.
    if (!resolve(path).startsWith(resolve(directory) + sep)) {
      throw new BadRequestException('Invalid file name')
    }

    if (await this.isReferenced(publicUrl)) {
      throw new NotFoundException('File not found')
    }

    // `force` makes a file that is already gone a no-op: deleting twice (a
    // retried request, a double click) must not answer with an error.
    await rm(path, { force: true })
  }

  private async isReferenced(publicUrl: string): Promise<boolean> {
    const [onMovement, onProfile] = await Promise.all([
      this.prisma.transaction.findFirst({
        where: { attachmentUrl: publicUrl },
        select: { id: true },
      }),
      this.prisma.user.findFirst({ where: { avatarUrl: publicUrl }, select: { id: true } }),
    ])
    return onMovement !== null || onProfile !== null
  }
}
