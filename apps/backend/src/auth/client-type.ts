import type { Request } from 'express'

/** Which app is calling. Sent by the front as `X-Client-Type` (see the shared
 * client package); anything unrecognised is treated as the web, which is the
 * safer default — it keeps the refresh token out of JavaScript's reach. */
export type ClientType = 'web' | 'mobile'

export function clientTypeOf(request: Request): ClientType {
  return request.headers['x-client-type'] === 'mobile' ? 'mobile' : 'web'
}
