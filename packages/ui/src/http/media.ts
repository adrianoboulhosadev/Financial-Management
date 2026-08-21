import { clientConfig } from '../config'

/**
 * Builds the absolute URL of an uploaded file. The backend stores a relative
 * path (e.g. "/uploads/avatars/x.png") and serves it statically; both apps run
 * on another origin, so the API base is prepended before anything renders it.
 */
export function mediaUrl(path: string): string {
  return `${clientConfig().apiUrl}${path}`
}
