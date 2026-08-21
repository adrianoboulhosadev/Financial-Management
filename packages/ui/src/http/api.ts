import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { clientConfig } from '../config'

/**
 * The HTTP client both apps share, with the session behaviour that used to live
 * in the web only.
 *
 * The ACCESS token lives in memory (never in localStorage or on disk): it
 * disappears on reload/relaunch and is recovered by the silent refresh. The
 * REFRESH token goes wherever the platform's TokenStorage puts it — an httpOnly
 * cookie on the web, the Keychain on the phone.
 */
let accessToken: string | null = null

/**
 * Whoever needs to REACT to the token changing — today the notification stream,
 * whose connection carries the token in its URL and therefore has to be
 * reopened when it rotates. A module-level variable cannot be watched by a
 * hook, so `setAccessToken` (the single door login/refresh/logout all go
 * through) announces it instead of anyone polling for it.
 */
type TokenListener = (token: string | null) => void
const tokenListeners = new Set<TokenListener>()

export function getAccessToken(): string | null {
  return accessToken
}

/** Returns the unsubscribe function, so a React effect can clean up. */
export function onAccessTokenChange(listener: TokenListener): () => void {
  tokenListeners.add(listener)
  return () => tokenListeners.delete(listener)
}

export function setAccessToken(token: string | null): void {
  accessToken = token
  tokenListeners.forEach((listener) => listener(token))
}

let instance: AxiosInstance | null = null
let refreshInstance: AxiosInstance | null = null

/** The main client: sends the cookie (web) and the Bearer via interceptor. */
export function api(): AxiosInstance {
  if (instance) return instance
  const { apiUrl, clientType } = clientConfig()

  instance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    headers: { 'X-Client-Type': clientType },
  })

  instance.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as
        (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
      if (error.response?.status === 401 && original && !original._retried) {
        original._retried = true
        try {
          const newToken = await refreshAccessToken()
          original.headers.Authorization = `Bearer ${newToken}`
          return instance!(original)
        } catch {
          setAccessToken(null)
          // let the 401 bubble up: the AuthProvider tears down the session.
        }
      }
      return Promise.reject(error)
    },
  )

  return instance
}

/** Client exclusive to /auth/refresh: has NO interceptors (avoids a 401 loop). */
function refreshClient(): AxiosInstance {
  if (refreshInstance) return refreshInstance
  const { apiUrl, clientType } = clientConfig()
  refreshInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    headers: { 'X-Client-Type': clientType },
  })
  return refreshInstance
}

/** What every auth route answers. `refreshToken` only comes back for a mobile
 * client — on the web it is in the cookie and never touches JavaScript. */
export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

// Dedup: concurrent 401s share a single in-flight /refresh.
let refreshInFlight: Promise<string> | null = null

export function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const { tokenStorage } = clientConfig()
      // The body is empty on the web (the cookie carries it) and holds the
      // stored token on mobile — one route, one shape, decided by the adapter.
      const storedRefresh = await tokenStorage.getRefreshToken()
      const { data } = await refreshClient().post<AuthTokens>('/auth/refresh', {
        refreshToken: storedRefresh ?? undefined,
      })
      await applyTokens(data)
      return data.accessToken
    })().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

/** The single place a fresh pair is taken in, from login OR from a rotation. */
export async function applyTokens(tokens: AuthTokens): Promise<void> {
  const { tokenStorage } = clientConfig()
  // Through setAccessToken, not a bare assignment: a rotated token has to reach
  // the listeners (the notification stream reopens with it).
  setAccessToken(tokens.accessToken)
  if (tokens.refreshToken !== undefined) await tokenStorage.setRefreshToken(tokens.refreshToken)
}

export async function clearTokens(): Promise<void> {
  setAccessToken(null)
  await clientConfig().tokenStorage.setRefreshToken(null)
}
