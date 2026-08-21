import { CONSOLE_NOTIFIER, COOKIE_TOKEN_STORAGE, type EventStreamFactory, type Notifier, type TokenStorage } from './ports'

/** Which app is calling. The backend reads it to decide whether the refresh
 * token goes in an httpOnly cookie (web) or in the response body (mobile). */
export type ClientType = 'web' | 'mobile'

export interface ClientConfig {
  apiUrl: string
  clientType: ClientType
  tokenStorage: TokenStorage
  notifier: Notifier
  eventStream: EventStreamFactory
}

let current: ClientConfig | null = null

/**
 * Wires the platform's adapters once, at app boot (before the first render that
 * touches a hook). Everything else in this package reads the result — which is
 * why a hook can be shared at all: it never knows whether it is running in a
 * browser or on a phone.
 */
export function configureClient(config: ClientConfig): void {
  current = config
}

export function clientConfig(): ClientConfig {
  if (!current) {
    throw new Error('configureClient() must run before any client hook is used')
  }
  return current
}

/** Defaults an app can start from and override piecemeal. */
export const WEB_CLIENT_DEFAULTS = {
  clientType: 'web' as const,
  tokenStorage: COOKIE_TOKEN_STORAGE,
  notifier: CONSOLE_NOTIFIER,
}
