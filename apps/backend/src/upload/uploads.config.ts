import { join } from 'path'

/**
 * Local (no cloud) file storage. Everything lives under apps/backend/uploads/
 * and is served statically at /uploads/** (see main.ts). The folder is
 * gitignored and, in docker, backed by a NAMED VOLUME — a receipt is the proof
 * behind a recorded expense, so losing it on a container rebuild would be losing
 * audit material.
 */
export const UPLOADS_DIR = join(process.cwd(), 'uploads')

/** One subfolder per theme. main.ts creates them all at boot, before multer
 * ever writes — a missing folder would fail the upload, not create itself. */
export const UPLOADS_SUBDIRS = ['receipts', 'avatars'] as const

export const RECEIPTS_UPLOAD_DIR = join(UPLOADS_DIR, 'receipts')
export const AVATARS_UPLOAD_DIR = join(UPLOADS_DIR, 'avatars')
