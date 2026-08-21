/**
 * How a shared hook tells the user something worked or failed. The web renders
 * a sonner toast; the phone renders its own — neither library survives the trip
 * to the other platform, so the hooks depend on this interface instead.
 */
export interface Notifier {
  success(message: string): void
  error(message: string): void
}

/** Used until an app configures its own, so a missing wiring is loud in the
 * console instead of silently swallowing every message. */
export const CONSOLE_NOTIFIER: Notifier = {
  success(message) {
    console.log(`[notify] ${message}`)
  },
  error(message) {
    console.warn(`[notify] ${message}`)
  },
}
