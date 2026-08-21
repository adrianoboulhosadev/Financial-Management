/**
 * Where the REFRESH token lives, which is the one thing the two apps genuinely
 * cannot share.
 *
 * On the web it lives in an `httpOnly` cookie the browser attaches by itself —
 * JavaScript never sees it, which is the whole point, so the web adapter stores
 * nothing and answers `null`. On the phone there is no cookie jar worth
 * trusting, so the app receives the token in the response body and keeps it in
 * the Keychain/Keystore (expo-secure-store).
 *
 * Behind this port, every other piece of the session — rotation, the 401 retry,
 * logout — is identical on both.
 */
export interface TokenStorage {
  getRefreshToken(): Promise<string | null>
  /** `null` clears it (logout, or a refresh that was refused). */
  setRefreshToken(token: string | null): Promise<void>
}

/**
 * The web's adapter, kept here because it is the same three lines in every web
 * app: the cookie IS the storage, so there is nothing to read or write.
 */
export const COOKIE_TOKEN_STORAGE: TokenStorage = {
  async getRefreshToken() {
    return null
  },
  async setRefreshToken() {},
}
