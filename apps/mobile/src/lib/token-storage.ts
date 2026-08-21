import * as SecureStore from 'expo-secure-store'
import type { TokenStorage } from 'ui'

const KEY = 'financial.refreshToken'

/**
 * The phone's adapter of the `TokenStorage` port: the Keychain (iOS) /
 * Keystore (Android), through expo-secure-store.
 *
 * This is why the backend hands the refresh token over in the body for mobile
 * at all — the destination is device-encrypted storage, not `localStorage`.
 * Anything less than SecureStore here and the whole arrangement would be worse
 * than the web's httpOnly cookie, not equivalent to it.
 */
export const secureTokenStorage: TokenStorage = {
  async getRefreshToken() {
    try {
      return await SecureStore.getItemAsync(KEY)
    } catch {
      // A device that refuses the keychain (locked, or a simulator quirk) is
      // treated as "no session" rather than a crash on boot.
      return null
    }
  },

  async setRefreshToken(token) {
    try {
      if (token === null) await SecureStore.deleteItemAsync(KEY)
      else await SecureStore.setItemAsync(KEY, token)
    } catch {
      // Same reasoning: failing to persist costs the silent re-login, never the
      // session the user is already in.
    }
  },
}
